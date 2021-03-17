const FuzzyMatching = require("fuzzy-matching");

const kWhitespaceRegex = new RegExp(/\s+/);
const kNotLetterRegex = new RegExp(/\P{L}/gu);
const toWords = string => string
    .split(kWhitespaceRegex)
    .map(x => x.replaceAll(kNotLetterRegex, "").toLowerCase())
    .filter(x => !!x.length);
const toPrefixes = 
    string => Array.from(new Set(
        string
            .split(kWhitespaceRegex)
            .map(x => x.replaceAll(kNotLetterRegex, "").toLowerCase().slice(0, 4))
    )).filter(x => !!x.length);


function fuzzyIntersect(sets) {
    let counts = new Map();
    for (let set of sets) {
        for (let x of set) {
            if (!counts.has(x)) counts.set(x, 0)
            counts.set(x, counts.get(x) + 1);
        }
    }
    return Array
        .from(counts.entries())
        .filter(([, v]) => v > (sets.length - 1) * 0.6)
        .map(([k]) => k);
}

export function populateSearchIndex(db, blockID, messages) {
    const prefixes = new Set();
    for (let message of messages) {
        for (let prefix of toPrefixes(message.body)) {
            prefixes.add(prefix);
        }
    }
    for (let prefix of prefixes) {
        const query = db.prefixIndex.where("prefix").equals(prefix);
        query.count().then(count => {
            !count && db.prefixIndex.add({prefix, blocks: []});
        }).then(() => {
            query.modify(x => x.blocks.push(blockID));
        });
    }
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

function scoreMessage(mesg, words) {
    let score = 0.0;
    let fm = new FuzzyMatching(toWords(mesg));
    for (let queryword of words) {
        let { value, distance } = fm.get(queryword);
        if (!value) continue;
        score += distance * (value.length / queryword.length);
    }
    return score / words.length;
}

export const searchBlock = (block, query) =>
    block
        .map(mesg => [mesg, scoreMessage(mesg.body, toWords(query))])
        .filter(([, score]) => score > 0.6)
        .sort(([, as], [, bs]) => bs - as)
        .map(([mesg]) => mesg);