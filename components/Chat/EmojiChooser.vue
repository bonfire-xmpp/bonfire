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
          <v-btn :ripple="false" icon v-for="(group, name) in $emoji.grouped" :key="name" @click="scrollTo(name)" class="pa-0 ma-0">
            <img height="22" :src="group[0].url">
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
                <div class="emoji" :data-src="emoji.url"></div>
              </span>
            </div>
          </div>
        </simplebar>
        <!-- BOTTOM BAR -->
        <div style="height: 54px; text-transform: capitalize;" ref="selection" class="d-flex flex-row flex-nowrap align-center">
          <img height="22" class="mr-4" :src="selectedEmoji">
          <p class="d-inline ma-0 mt-2">{{selectedEmojiLabel}}</p>
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
  width: 100%;
  height: 32px;
  visibility: hidden;
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
      const offset = 300;
      const scrolltop = scrollel.scrollTop - offset;
      const scrollbottom = scrollel.scrollTop + scrollel.clientHeight + offset;
      const visqueue = [], invisqueue = [];
      for (const el of scrollel.querySelectorAll(".emoji-group")) {
        // if bottom edge is above viewport or top edge is below
        const hidden = el.offsetTop + el.clientHeight <= scrolltop || el.offsetTop >= scrollbottom;
        (hidden ? invisqueue : visqueue).push(el);
      }
      for (const el of visqueue) {
        for (const img of el.querySelectorAll(".emoji")) {
          if (!img.style.background) img.style.background = "url('" + img.getAttribute("data-src") + "')";
        }
        el.style.visibility = "inherit";
      }
      this.$nextTick(() => {
        for (const el of invisqueue) {
          el.style.visibility = "hidden";
        }
      });
    },
    getEmojiUrl (emoji) {
      return this.$emoji.byEmoji(emoji).url;
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

    let timeout = null;
    scrollel.onscroll = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(this.hideOffscreen, 5);
    };
    setTimeout(() => this.hideOffscreen());
  },
}
</script>
