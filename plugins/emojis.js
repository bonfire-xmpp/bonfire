let emojis = require("@/static/emoji/emoji.json");

for (const key in emojis.byname) {
  emojis.byname[key] = emojis.emojis[emojis.byname[key]];
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
    ...emojis
  });
};