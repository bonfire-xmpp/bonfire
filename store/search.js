const FuzzyMatching = require("fuzzy-matching");

const kWordBreakRegex = new RegExp(/\P{L}+/u);
const kNotLetterRegex = new RegExp(/\P{L}/gu);
const toWords = string => string
    .split(kWordBreakRegex)
    .map(x => x.replaceAll(kNotLetterRegex, "").toLowerCase())
    .filter(x => !!x.length);
const toPrefixes = 
    string => Array.from(new Set(
        string
            .split(kWordBreakRegex)
            .map(x => x.replaceAll(kNotLetterRegex, "").toLowerCase().slice(0, 4))
    )).filter(x => !!x.length);


function fuzzyIntersect(sets) {
    let counts = new Map();
    for (let x of sets.flat(1)) {
        counts.set(x, (counts.get(x) || 1) + 1);
    }
    return Array.from(counts.entries())
        .filter(([, v]) => v > (sets.length - 1) * 0.4)
        .map(([k]) => k);
}

export async function populateSearchIndex(db, blockID, messages) {
    const prefixes = new Set();
    for (let message of messages) {
        for (let prefix of toPrefixes(message.body)) {
            prefixes.add(prefix);
        }
    }

    await db.transaction("rw", db.prefixIndex, async () => {
        for (let prefix of prefixes) {
            const query = db.prefixIndex.where("prefix").equals(prefix);
            await query.count().then(count => {
                !count && db.prefixIndex.add({prefix, blocks: []});
            }).then(() => {
                query.modify(x => x.blocks.push(blockID));
            });
        }
    });
}

export async function search(query) {
    let entries = await db.prefixIndex
        .where("prefix")
        .startsWithAnyOf(toPrefixes(query))
        .toArray();
    return await db.messageArchive
        .where("id")
        .anyOf(fuzzyIntersect(entries.map(x => x?.blocks || [])))
        .toArray();
}

function scoreMessage(mesg, querywords) {
    let score = 0.0;
    let mesgwords = toWords(mesg);
    let fm = new FuzzyMatching(mesgwords);
    for (let queryword of querywords) {
        let { value, distance } = fm.get(queryword);
        if (!value) {
            for (let mesgword of mesgwords) {
                if (mesgword.startsWith(queryword)) {
                    score += 0.5;
                }
            }
            continue;
        }
        score += distance * Math.max(1, value.length / queryword.length);
    }
    return score / querywords.length;
}

export const searchBlock = (block, query) => {
    let words = toWords(query);
    return block
        .map(mesg => [mesg, scoreMessage(mesg.body, words)])
        .filter(([, score]) => score > 0.6);
}
