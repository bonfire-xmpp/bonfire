<template>
  <div class="emoji-chooser grey-100 d-block elevation-3">
    <div class="d-flex flex-row flex-nowrap h-100" style="overflow: hidden;">
      <!-- TABS -->
      <simplebar 
        data-simplebar-auto-hide="false"
        data-simplebar-force-visible="true"
        class="narrow-scrollbar"
        style="width: 54px !important;"
        ref="tabs">
        <div class="emoji-tabs d-flex align-center justify-center flex-column flex-nowrap">
          <v-btn :ripple="false" icon v-for="(group, name) in $emoji.grouped" :key="name" @click="scrollTo(name)" :class="['emoji-tab-' + proccessGroupName(name), 'pa-0', 'ma-0', 'emoji-tab']">
            <div class="emoji" :style="{ 'background-position': getEmojiOffset(group[0]) }"/>
          </v-btn>
        </div>
      </simplebar>

      <!-- EMOJI LIST -->
      <div class="d-flex flex-column" style="width: fit-content;">
        <simplebar
          data-simplebar-auto-hide="false"
          data-simplebar-force-visible="true"
          class="emoji-list narrow-scrollbar h-100"
          ref="emojiList">
          <emoji-category v-for="(group, groupname) in $emoji.grouped" :key="groupname"
                          :group="group" :groupname="groupname"
                          @emojihover="emojihover" @emojileave="emojileave" @insert-emoji="insertEmoji"/>
        </simplebar>
        <!-- BOTTOM BAR -->
        <div style="height: 54px; text-transform: capitalize;" ref="selection" class="d-flex flex-row flex-nowrap align-center">
          <div v-if="selectedEmoji" height="22" class="mr-4 emoji" :style="{ 'background-position': getEmojiOffset(selectedEmoji) }"></div>
          <p class="d-inline ma-0 mt-2">{{selectedEmojiLabel}}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$anim-duration: 0.2s;

.emoji-chooser {
  pointer-events: auto;
  cursor: default;
  height: 360px;
  white-space: normal !important;
}
.emoji-list {
  padding-top: 8px;
  padding-bottom: 8px;
  width: 310px;
}
.emoji-tabs {
  padding-top: 4px;
  padding-bottom: 4px;
}
.emoji-tab {
  transition: $anim-duration * 2;
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

export default {
  name: "EmojiChooser",
  components: { EmojiCategory },

  data () {
    return {
      selectedEmoji: "",
      selectedEmojiLabel: "",
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
        const hdr = this.$refs.tabs.$el.querySelector(".emoji-tab-" + el.getAttribute("data-groupname"));
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
        const hidden = el.offsetTop + el.clientHeight <= scrolltop || el.offsetTop >= scrollbottom;
        (hidden ? invisqueue : visqueue).push(el);
      }
      for (const el of visqueue) {
        el.style.visibility = "visible";
        if (!el.hasAttribute("data-marked")) {
          for (const emoji of el.querySelectorAll(".emoji")) {
            emoji.style.backgroundPosition ||= emoji.getAttribute("data-bgpos");
          }
          el.setAttribute("data-marked", "");
        }
      }
      for (const el of invisqueue) {
        el.style.visibility = "hidden";
      }
    },
    scrollTo(groupName) {
      const scrollel = this.$refs.emojiList.scrollElement;
      let scrollpos = scrollel.scrollTop;
      let scrolltgt = scrollel.getElementsByClassName("emoji-group-" + this.proccessGroupName(groupName))[0].offsetTop;
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
        scrollel.getElementsByClassName("emoji-group-" + this.proccessGroupName(groupName))[0].offsetTop
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
    scrollel.onscroll = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => this.scrollUpdate(), 5);
    };
    this.scrollUpdate();
  },
}
</script>
