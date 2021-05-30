export function proccessGroupName(groupName) {
  return groupName.replaceAll(/\s+/g, "-").replaceAll(/[^\w\d]/g, "").toLowerCase();
}

export function getEmojiOffset(emoji) {
  return `${-emoji.offset[0]*(22/64)}px ${-emoji.offset[1]*(22/64)}px`;
}
