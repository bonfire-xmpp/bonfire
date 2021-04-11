import db from '@/assets/messageDb';
import * as msgpack from "@msgpack/msgpack";
import messageDb from "assets/messageDb";

const FuzzyMatching = require("fuzzy-matching");
const lz4 = require("lz4js");

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
    if (sets.length === 1) return sets[0];
    let counts = new Map();
    for (let x of sets.flat(1)) {
        counts.set(x, (counts.get(x) || 1) + 1);
    }
    return Array.from(counts.entries())
        .filter(([, v]) => v > 1)
        .map(([k]) => k);
}

async function populateSearchIndex(blockID, messages) {
    const prefixes = new Set();
    for (let message of messages) {
        for (let prefix of toPrefixes(message.body)) {
            prefixes.add(prefix);
        }
    }

    await db.transaction("rw", db.prefixIndex, async () => {
        for (let prefix of prefixes) {
            const query = db.prefixIndex.where("prefix").equals(prefix);

            const count = await query.count();
            !count && await db.prefixIndex.add({prefix, blocks: []});

            await query.modify(x => x.blocks.push(blockID));
        }
    });
}

async function search(query) {
    let entries = await db.prefixIndex
        .where("prefix")
        .startsWithAnyOf(toPrefixes(query))
        .toArray();
    return await db.messageArchive
        .where("id")
        .anyOf(fuzzyIntersect(entries.map(x => x && x.blocks || [])))
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

const searchBlock = (block, query) => {
    let words = toWords(query);
    return block
        .map(mesg => [mesg, scoreMessage(mesg.body, words)])
        .filter(([, score]) => score > 0.8);
}

async function insertBlock(messages, jid) {
    let timestamp = messages[0].timestamp;
    console.warn(timestamp);
    if(!timestamp) return console.error(`[search worker] insertBlock(): Received message with no timestamp!`, messages);

    let compblock = lz4.compress(Buffer.from(msgpack.encode(messages)));
    let id = await db.messageArchive.add({ block: compblock, timestamp, with: jid });
    await populateSearchIndex(id, messages);
}

async function splitBlocks(bareJid, kBlockSize) {
    // message block archive
    let condition = false;
    await messageDb.transaction("rw!", messageDb.messages, messageDb.messageArchive, messageDb.prefixIndex, async () => {
        const query = messageDb.messages.where("with").equals(bareJid);
        if ((await query.count()) >= kBlockSize) {
            // block timestamp is first message timestamp
            await insertBlock(await query.sortBy("timestamp"), bareJid);
            await query.delete();
            condition = true;
        }
    });

    return condition;
}

const api = new Map([
    ['searchBlock', searchBlock],
    ['search', search],
    ['populateSearchIndex', populateSearchIndex],
    ['insertBlock', insertBlock],
    ['splitBlocks', splitBlocks],
]);

onmessage = async function (e) {
    // MUST NOT be undefined. Otherwise, program is ill-formed, no diagnostic required.
    const id = e.data[0];

    const fun = api.get(e.data[1]);
    if(!fun) {
        console.warn(`[search worker] No API call '${e.data[1]}' found`);
        return postMessage({id, result: null});
    }

    postMessage({id, result: await fun(...e.data.slice(2))});
};
