const kWhitespaceRegex = new RegExp(/\s+/);
const kNotLetterRegex = new RegExp(/\P{L}/gu);
const toPrefixes = 
    string => new Set(
        string
            .split(kWhitespaceRegex)
            .map(x => x.replaceAll(kNotLetterRegex, "").toLowerCase().slice(0, 4)))
            .filter(x => !!x.length);

function intersect(sets) {
    sets = sets.sort((a, b) => a.length > b.length ? -1 : 1);
    if (!sets[sets.length - 1].size) return [];
    for (let i = sets.length - 2; i >= 0; --i) {
        let set = new Set();
        for (let x of sets[i + 1]) {
            if (sets[i].has(x)) set.add(x);
        }
        sets[i] = set;
        sets.pop();
    }
    return sets[0];
}

function fuzzyIntersect(sets) {
    let counts = {};
    for (let set of sets) {
        for (let x of set) {
            counts[x] ||= 0;
            ++counts[x];
        }
    }
    return new Set(
        Object.entries(counts)
            .filter(([, v]) => v >= sets.length * 0.6)
            .map(([k,]) => k))
}

function condenseRanges(array) {
    if (!array.length) return [];
    let ranges = [];
    let start = 0;
    let end = 0;
    let last = array[0];
    for (let i = 1; i < array.length; ++i) {
        if (array[i] - last == 1) {
            ++end;
        } else {
            if (end - start == 0) {
                ranges.push(start);
            } else {
                ranges.push([start, end]);
            }
            start = array[i];
            end = array[i];
        }
        last = array[i];
    }
    if (end - start == 0) {
        ranges.push(start);
    } else {
        ranges.push([start, end]);
    }
    return ranges;
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