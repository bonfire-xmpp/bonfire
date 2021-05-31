<template>
  <div class="emoji-chooser d-block">
    <div class="d-flex flex-row flex-nowrap h-100 justify-space-between" style="overflow: hidden;">
      <!-- TABS -->
      <simplebar 
        data-simplebar-auto-hide="false"
        data-simplebar-force-visible="true"
        class="narrow-scrollbar"
        style="width: 54px !important;"
        ref="tabs">
        <div class="emoji-tabs d-flex align-center justify-center flex-column flex-nowrap">
          <div v-for="(group, name) in $emoji.grouped" :key="name" 
                 @click="scrollTo(name)" :class="['emoji-tab-' + processGroupName(name), 'pa-0', 'ma-0', 'my-2', 'emoji-tab', 'emoji']"
                 :style="{ 'background-position': getEmojiOffset(group[0]) }"/>
        </div>
      </simplebar>

      <!-- EMOJI LIST -->
      <div class="d-flex flex-column flex-grow-1 align-center">
        <simplebar
          data-simplebar-auto-hide="false"
          data-simplebar-force-visible="true"
          class="emoji-list narrow-scrollbar h-100"
          ref="emojiList">
          <emoji-category v-for="(group, groupname) in $emoji.grouped" :key="groupname" :shown="shown[groupname]"
                          :group="group" :groupname="groupname"
                          @emojihover="emojihover" @emojileave="emojileave" @insert-emoji="insertEmoji"/>
        </simplebar>
        <!-- BOTTOM BAR -->
        <div style="text-transform: capitalize;" ref="selection" class="emoji-bottombar d-flex flex-row flex-nowrap align-center">
          <div v-if="selectedEmoji" class="mr-4 emoji" :style="{ 'background-position': getEmojiOffset(selectedEmoji) }"></div>
          <div v-else style="height: 22px"/>
          <p class="d-inline ma-0 mt-2">{{selectedEmojiLabel}}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$anim-duration: 0.2s;
$background: map-get($greys, "100");

.emoji-chooser {
  pointer-events: auto;
  cursor: default;
  // height: 360px;
  max-width: 500px;
  white-space: normal !important;
  background: $background;
  height: 100%;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}
.emoji-list {
  padding-top: 8px;
  padding-bottom: 8px;
  width: 280px;
  height: auto !important;
}
.emoji-tabs {
  padding-top: 4px;
  padding-bottom: 4px;
}
.emoji-tab {
  flex-grow: 0;
  flex-shrink: 1;
  width: 0;
  transition: $anim-duration * 2;
}
.emoji-bottombar {
  background: $background;
  height: 48px;
  flex-shrink: 0;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}
.emoji-chooser::v-deep .emoji {
  cursor: pointer;
  transform: scale(1.0);
  transition: transform $anim-duration;
  overflow: visible;
  width: 22px !important;
  height: 22px !important;
  margin: 0;
  padding: 0;
}
.emoji-chooser::v-deep .simplebar-content {
  padding: 0 !important;
}
</style>

<script>
import EmojiCategory from "@/components/Chat/Emoji/EmojiCategory";
import * as Common from "./common";
import Vue from "vue";

export default {
  name: "EmojiChooser",
  components: { EmojiCategory },

  data () {
    return {
      selectedEmoji: "",
      selectedEmojiLabel: "",

      shown: {},
    };
  },

  methods: {
    emojihover (emoji) {
      this.selectedEmoji = emoji;
      this.selectedEmojiLabel = emoji.description;
    },
    emojileave() {
      this.selectedEmoji = "";
      this.selectedEmojiLabel = "";
    },

    async updateActiveTab () {
      const scrollel = this.$refs.emojiList.scrollElement;
      for (const el of scrollel.querySelectorAll(".emoji-category")) {
        const hdr = this.$refs.tabs.$el.querySelector(".emoji-tab-" + this.processGroupName(el.getAttribute("data-groupname")));
        if (el.offsetTop <= scrollel.scrollTop && el.offsetTop + el.clientHeight > scrollel.scrollTop) {
          hdr.style.transform = "scale(1.5)";
        } else {
          hdr.style.transform = "scale(1.0)";
        }
      }
    },

    async scrollUpdate () {      
      this.updateActiveTab();

      // Update visible categories
      const scrollel = this.$refs.emojiList.scrollElement;
      const offset = 200;
      const scrolltop = scrollel.scrollTop - offset;
      const scrollbottom = scrollel.scrollTop + scrollel.clientHeight + offset;
      const visqueue = [], invisqueue = [];

      for (const el of scrollel.querySelectorAll(".emoji-category")) {
        // if bottom edge is above viewport or top edge is below
        const hidden = el.offsetTop + el.clientHeight < scrolltop || el.offsetTop > scrollbottom;
        (hidden ? invisqueue : visqueue).push(el);
      }
      for (const el of visqueue) {
        Vue.set(this.shown, el.getAttribute("data-groupname"), true);
      }
      for (const el of invisqueue) {
        Vue.set(this.shown, el.getAttribute("data-groupname"), false);
      }
    },
    scrollTo(groupName) {
      const scrollel = this.$refs.emojiList.scrollElement;
      let scrollpos = scrollel.scrollTop;
      let scrolltgt = scrollel.getElementsByClassName("emoji-group-" + this.processGroupName(groupName))[0].offsetTop;
      const duration = Math.max(0, 800 - 100 / Math.abs(scrolltgt - scrollpos));
      function easeInOutCubic(x) {
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
      }
      let start = 0;
      function update() {
        const elapsed = Date.now() - start;
        const alpha = easeInOutCubic(elapsed / duration);
        scrollel.scrollTo(0, Math.round((1-alpha)*scrollpos + alpha*scrolltgt));
        if (elapsed <= duration) requestAnimationFrame(update);
        else scrollel.scrollTo(0, scrolltgt);
      }
      start = Date.now();
      update();
      /*
      scrollel.scrollTo(
        0,
        scrollel.getElementsByClassName("emoji-group-" + this.processGroupName(groupName))[0].offsetTop
      );
      */
    },
    insertEmoji(emoji) {
      this.$emit("insert-emoji", emoji);
    },

    ...Common,
  },

  mounted () {
    const scrollel = this.$refs.emojiList.scrollElement;
    let timeout = null;
    scrollel.addEventListener("scroll", () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => this.scrollUpdate(), 5);
    }, { passive: true });
    this.scrollUpdate();
  },
}
</script>
