const kEmojiSize = 48;

export function processGroupName(groupName) {
  return groupName.replaceAll(/\s+/g, "-").replaceAll(/[^\w\d]/g, "").toLowerCase();
}

export function getEmojiOffset(emoji) {
  return `${-emoji.offset[0]*(22/kEmojiSize)}px ${-emoji.offset[1]*(22/kEmojiSize)}px !important`;
}
