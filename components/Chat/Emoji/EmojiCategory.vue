<template>
  <div :class="['emoji-group-' + proccessGroupName(groupname), 'emoji-category', 'py-0', 'my-0']" :data-groupname="proccessGroupName(groupname)">
    <p class="groupheader py-4 my-0">{{groupname}}</p>
    <div class="emoji-group" v-for="(subgroup, i) of splitGroups(group, 8)" :key="i">
      <span icon v-for="emoji of subgroup" 
        :key="emoji.emoji" 
        :data-emoji="emoji.name"
        class="emoji-button"
        @mouseenter.prevent="$emit('emojihover', emoji)"
        @mouseleave.prevent="$emit('emojileave')"
        @click.prevent="$emit('insert-emoji', emoji.emoji)">
        <div class="emoji" :data-bgpos="getEmojiOffset(emoji)"></div>
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.emoji-category {
  visibility: hidden;
}
.emoji-group {
  position: relative;
  display: block;
  white-space: nowrap;
  overflow: visible;
  width: 0;
  height: 32px;
}
.groupheader {
  display: block;
  position: sticky;
  left: 0;
  top: 0;
  width: 100%;
  background: map-get($greys, "100");
  z-index: 1;
}
.emoji-button {
  overflow: visible;
  cursor: pointer;
  padding: 8px;
  width: 22px !important;
  height: 22px !important;
  transform: scale(1.0);
  position: relative;
  &:hover::v-deep .emoji {
    transform: scale(1.5);
  }
}
</style>

<script>
import * as Common from "./common";

export default {
  name: "EmojiCategory",

  props: {
    groupname: {
      type: String,
      required: true,
    },
    group: {
      type: Array,
      required: true,
    }
  },

  methods: {
    splitGroups (arr, gsize) {
      const groups = [];
      for (let i = 0; i < arr.length; ++i) {
        if (i % gsize == 0) groups.push([]);
        groups[groups.length - 1].push(arr[i]);
      }
      return groups;
    },
    ...Common,
  },
};
</script>