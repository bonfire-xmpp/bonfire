let emojis = require("@/static/emoji/emoji.json");

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
    ...emojis
  });
};