import { parse } from "twemoji-parser";
let emojis = require("@/static/gemoji/emoji.json");

const toKebab = str => str.replaceAll(/\s+/g, "-");
const mapKeyed = (arr, keyfield) => 
  Object.fromEntries(
    arr.map(({ [keyfield]: key, ...value }) => [key, value]));
const groupBy = (arr, keyfield) => {
  const groups = {};
  for (const { [keyfield]: key, ...value } of arr) {
    (groups[key] ||= []).push(value);
  }
  return groups;
};

emojis = emojis.map(({description, emoji, ...rest}) => ({ 
  name: toKebab(description),
  description,
  emoji,
  url: parse(emoji, { assetType: "png" })[0].url,
  ...rest
})).filter(({ name }) => !name.includes(":"));
const emojisByName = mapKeyed(emojis, "name");
const emojisByEmoji = mapKeyed(emojis, "emoji");

const emoji = {
  byName: name => emojisByName[name],
  byEmoji: emoji => emojisByEmoji[emoji],
  grouped: groupBy(emojis, "category"),
};

export default (context, inject) => {
  inject("emoji", emoji);
};