<template>
  <div class="emoji-chooser grey-100 d-block elevation-3">
    <div class="d-flex flex-row flex-nowrap h-100" style="overflow: hidden;">
      <!-- TABS -->
      <simplebar 
        data-simplebar-auto-hide="false"
        data-simplebar-force-visible="true"
        class="emoji-list narrow-scrollbar h-100"
        style="width: 54px !important;"
        ref="tabs">
        <v-btn :ripple="false" icon v-for="(_, name) in $emoji.grouped" :key="name" @click="scrollTo(name)" class="pa-0 ma-0">
          {{$emoji.grouped[name][0].emoji}}
        </v-btn>
      </simplebar>

      <!-- EMOJI LIST -->
      <div class="d-flex flex-grow-1 flex-column">
        <simplebar
          data-simplebar-auto-hide="false"
          data-simplebar-force-visible="true"
          class="emoji-list narrow-scrollbar h-100 w-100"
          ref="emojiList">
          <div v-for="(group, groupname) in $emoji.grouped" :key="groupname" :class="'emoji-group-' + groupname">
            <p class="groupheader py-4 my-0">{{groupname}}</p>
            <div class="emoji-group" v-for="(subgroup, i) of splitGroups(group, 8)" :key="i">
              <span icon v-for="emoji of subgroup" 
                :key="emoji.emoji" 
                :data-emoji="emoji.name"
                class="emoji-button"
                @mouseenter="emojihover"
                @mouseleave="emojileave"
                @click="insertEmoji(emoji.emoji)">
                <div class="emoji" :data-src="getEmojiUrl(emoji.emoji)"></div>
              </span>
            </div>
          </div>
        </simplebar>
        <!-- BOTTOM BAR -->
        <div style="height: 54px; position: relative;" ref="selection">
          <div style="display: block; position: absolute; text-transform: capitalize; bottom: 0;" class="d-flex align-center flex-row">
            <img height="22" class="d-inline-block mr-4" style="margin-bottom: 11px;" :src="selectedEmoji">
            <p class="d-inline-block ma-0" style="height: 22px;">{{selectedEmojiLabel}}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.groupheader {
  display: block;
  position: sticky;
  left: 0;
  top: 0;
  width: 100%;
  background: map-get($greys, "100");
  z-index: 1;
}
.emoji-list {
  padding: 16px;
  display: flex;
  flex-flow: column nowrap;
}
.emoji-button {
  overflow: visible;
  cursor: pointer;
  padding: 8px;
  width: 22px !important;
  height: 22px !important;
  transform: scale(1.0);
  &:hover::v-deep .emoji {
    transform: scale(1.5);
  }
}
.emoji-chooser {
  pointer-events: auto;
  cursor: default;
  width: 420px;
  height: 360px;
  overflow: visible !important;
  white-space: normal !important;
}
.emoji-category:not(:first-of-type) {
  display: none !important;
}
.emoji-group {
  display: block;
  // flex-flow: row wrap;
  width: 100%;
  height: 32px;
}
.emoji-chooser::v-deep .emoji {
  cursor: pointer;
  transform: scale(1.0);
  transition: 0.2s;
  // visibility: hidden;
  width: 22px !important;
  height: 22px !important;
  margin: 0;
  padding: 0;
}
</style>

<script>
import twemoji from "twemoji";
import { parse } from "twemoji-parser";

const clamp = (x, l, u) => Math.max(Math.min(x, u), l);

export default {
  name: "EmojiChooser",

  data () {
    return {
      selectedEmoji: "",
      selectedEmojiLabel: "",
    };
  },

  methods: {
    emojihover ({ target }) {
      const emoji = this.$emoji.byName(target.getAttribute("data-emoji"));
      if (!emoji) return;
      this.selectedEmoji = this.getEmojiUrl(emoji.emoji);
      this.selectedEmojiLabel = emoji.description;
    },
    emojileave({ target }) {
      this.selectedEmoji = "";
      this.selectedEmojiLabel = "";
    },
    hideOffscreen () {
      const scrollel = this.$refs.emojiList.scrollElement;
      const scrolltop = scrollel.scrollTop;
      const scrollbottom = scrolltop + scrollel.clientHeight;
      const queue = [];
      const offset = 400;
      for (const el of scrollel.getElementsByClassName("emoji-group")) {
        const eltop = el.offsetTop;
        const elbottom = eltop + el.clientHeight;
        const top = clamp(eltop, scrolltop - offset, scrollbottom + offset);
        const bottom = clamp(elbottom, scrolltop - offset, scrollbottom + offset);
        if (top == bottom) {
          el.style.visibility = "hidden";
        } else {
          queue.push(el);
        }
      }
      for (const el of queue) {
        for (const img of el.getElementsByClassName("emoji")) {
          if (!img.style.background) img.style.background = "url('" + img.getAttribute("data-src") + "')";
        }
        el.style.visibility = "visible";
      }
    },
    getEmojiUrl (emoji) {
      return parse(emoji, { assetType: "png" })[0].url;
    },
    splitGroups (arr, gsize) {
      const groups = [];
      for (let i = 0; i < arr.length; ++i) {
        if (i % gsize == 0) groups.push([]);
        groups[groups.length - 1].push(arr[i]);
      }
      return groups;
    },
    scrollTo(groupName) {
      const scrollel = this.$refs.emojiList.scrollElement;
      scrollel.scrollTo(
        0,
        scrollel.getElementsByClassName("emoji-group-" + groupName)[0].offsetTop
      );
    },
    insertEmoji(emoji) {
      this.$emit("insert-emoji", emoji);
    },
  },

  watch: {
  },

  mounted () {
    twemoji.parse(this.$refs.tabs.$el);
    this.group = "Smileys & Emotion";
    const scrollel = this.$refs.emojiList.scrollElement;
    scrollel.onscroll = this.hideOffscreen;
    setTimeout(() => this.hideOffscreen());
  },
}
</script>
