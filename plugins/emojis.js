const emojiRegex = require('emoji-regex/RGI_Emoji.js');
const emojis = require("@/static/emoji/emoji.json");

const towords = str => str.split("_");

emojis.searchmap = {};

for (const key in emojis.byname) {
  emojis.byname[key] = emojis.emojis[emojis.byname[key]];
  for (const word of towords(key)) {
    (emojis.searchmap[word.slice(0, 2)] ??= []).push({ ...emojis.byname[key], name: key });
  }
}
for (const key in emojis.byemoji) {
  emojis.byemoji[key] = emojis.emojis[emojis.byemoji[key]];
}

const groupBy = (arr, key) => {
  const groups = {};
  for (const x of arr) {
    (groups[x[key]] ||= []).push(x);
  }
  return groups;
};

export default (context, inject) => {
  inject("emoji", {
    grouped: groupBy(emojis.emojis, "category"),
    regex: emojiRegex(),
    ...emojis
  });
};
