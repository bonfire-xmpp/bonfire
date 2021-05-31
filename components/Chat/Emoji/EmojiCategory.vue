<template>
  <div :class="['emoji-group-' + processGroupName(groupname), 'emoji-category', 'py-0', 'my-0']" :data-groupname="groupname">
    <p class="groupheader py-4 my-0">{{groupname}}</p>
    <div v-if="shown">
      <div class="emoji-group" v-for="(subgroup, i) of splitGroups(group, 8)" :key="i">
        <span icon v-for="emoji of subgroup" 
          :key="emoji.emoji" 
          :data-emoji="emoji.name"
          class="emoji-button"
          @mouseenter.prevent="$emit('emojihover', emoji)"
          @mouseleave.prevent="$emit('emojileave')"
          @click.prevent="$emit('insert-emoji', emoji.emoji)">
          <div class="emoji" :style="{ 'background-position': getEmojiOffset(emoji) }"></div>
        </span>
      </div>
    </div>
    <div v-else :style="{ 'display': 'block', 'height': categoryHeight }">
    </div>
  </div>
</template>

<style lang="scss" scoped>
.emoji-category {
  position: relative;
  margin-left: auto;
  margin-right: auto;
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
  padding: 6px;
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
    },
    shown: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  computed: {
    categoryHeight () {
      return Math.ceil(this.group.length / 8) * (22 + 6*2) + "px";
    },
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