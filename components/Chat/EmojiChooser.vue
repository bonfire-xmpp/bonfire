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
          <v-btn :ripple="false" icon v-for="(_, name) in $emoji.grouped" :key="name" @click="scrollTo(name)" class="pa-0 ma-0">
            {{$emoji.grouped[name][0].emoji}}
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
          <div v-for="(group, groupname) in $emoji.grouped" :key="groupname" :class="['emoji-group-' + proccessGroupName(groupname), 'emoji-category', 'py-0', 'my-0']">
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
$anim-duration: 0.1s;

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
.emoji-category {
  overflow: visible;
}
.emoji-group {
  position: relative;
  display: block;
  white-space: nowrap;
  overflow: visible;
  width: fit-content;
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
  // the header bar cuts off the selected emoji, so this briefly raises
  // the z-index to overlap it when the emoji is being hovered
  transition: $anim-duration;
  z-index: 0;
  &:hover {
    z-index: 1;
  }
}
.emoji-chooser::v-deep .emoji {
  cursor: pointer;
  transform: scale(1.0);
  transition: $anim-duration;
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
    proccessGroupName (groupName) {
      return groupName.replaceAll(/\s+/g, "-").toLowerCase();
    },
    scrollTo(groupName) {
      const scrollel = this.$refs.emojiList.scrollElement;
      scrollel.scrollTo(
        0,
        scrollel.getElementsByClassName("emoji-group-" + this.proccessGroupName(groupName))[0].offsetTop
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
