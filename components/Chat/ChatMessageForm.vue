<template>
  <form @submit.prevent="emitMessage"
        class="px-4 message-form mt-n2">
    <text-input v-model="message"
                :placeholder="label"
                ref="textArea"
                @enter="emitMessage"
                @input="change"
                @keydown.native="onKeyPress"
                @text-click="onClick">
      <template #append>
        <autocomplete 
          v-if="autocompleteActive" 
          ref="autocomplete" 
          v-click-outside="closeAutocomplete"
          :entries="autocompleteEntries"
          style="visibility: hidden;"
          @submit="completeEmoji"/>
        <overlay-menu class="ma-0" v-if="!$device.isMobileOrTablet">
          <template #activator="{ on }">
            <v-icon class="chat-form-button" @click="on">mdi-emoticon</v-icon>
          </template>
          <template #default="{ off }">
            <emoji-picker style="height: 380px !important;" @insert-emoji="insertEmoji($event); off()"/>
          </template>
        </overlay-menu>
        <span v-else>
          <v-icon class="chat-form-button" @click="$refs.emojiDialog.open()">mdi-emoticon</v-icon>
          <bottom-sheet ref="emojiDialog">
            <emoji-picker @insert-emoji="insertEmoji($event); $refs.emojiDialog.close()"/>
          </bottom-sheet>
        </span>
      </template>
    </text-input>
    <div class="gutter white--text d-flex flex-row align-center">
      <slot/>
    </div>
  </form>
</template>

<script>
  import EmojiPicker from "@/components/Chat/Emoji/EmojiPicker";
  import OverlayMenu from "@/components/OverlayMenu";
  import Autocomplete from './Emoji/Autocomplete.vue';

  export default {
    name: "ChatMessageForm",
    components: { EmojiPicker, OverlayMenu, Autocomplete },

    props: {
      label: {
        type: String,
        optional: true,
        default: '',
      }
    },

    data() {
      return {
        composingTimeout: null,

        autocompleteActive: false,
        autocompleteEntries: [],

        message: "",
      }
    },

    methods: {
      emitMessage() {
        if (!this.message?.length) return;
        this.$emit('message', this.message);
        this.message = "";
      },

      change(data) {
        // Start composing on start edge
        if(!this.composingTimeout) {
          this.$emit('composing');
          this.range = window.getSelection().getRangeAt(0);
        }

        // Update autocomplete state
        // setImmediate to wait for new text area range
        setImmediate(() =>
          this.updateAutocomplete(this.$refs.textArea.range));

        // Debounce
        clearTimeout(this.composingTimeout);
        this.composingTimeout = setTimeout(() => {
          this.composingTimeout = undefined;
          // console.log('paused')
          this.$emit('paused');
        }, 2000);
      },

      insertEmoji (emoji) {
        const range = this.$refs.textArea.range;
        const sel = window.getSelection();
        sel.removeAllRanges();
        if (range) {
          sel.addRange(range);
        }
        this.$refs.textArea.focus();
        document.execCommand("insertText", false, emoji);
      },

      updateAutocomplete(range) {
        if (!range) return;
        const data = range.startContainer.textContent;
        let searchstr = data.slice(0, range.startOffset);
        searchstr = searchstr.slice(searchstr.lastIndexOf(':'));

        const match = searchstr.match(/:([^\s:]{2,})$/);
        if (match) {
          const candidates = 
            this.$emoji.searchmap[match[1].slice(0, 2)]
            ?.filter(({ name }) => 
              name.startsWith(match[1]) || name.split("_").some(x => x.includes(match[1])));

          const wasactive = this.autocompleteActive;
          if (candidates?.length) {
            setImmediate(() => {
              const autocomplete = this.$refs.autocomplete;
              if (!autocomplete) return;
              const { left: leftA, bottom: topA } = this.$refs.textArea.$el.getBoundingClientRect();
              const { left: leftB, top: topB } = this.$refs.textArea.range.getBoundingClientRect();
              let offsetX = Math.min(Math.max(0, leftB - leftA - 280/2), this.$refs.textArea.$el.clientWidth - 280);
              let offsetY = topB - topA + 40;

              // animation
              if (!wasactive) autocomplete.$el.style.visibility = "hidden";
              this.$nextTick(() => {
                autocomplete.$el.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
              });
              if (!wasactive) {
                setTimeout(() => {
                  autocomplete.$el.style.transition = "transform 0.2s";
                  autocomplete.$el.style.visibility = "visible";
                }, 10);
              }
            });
          } else {
            if (this.$refs.autocomplete) 
              this.$refs.autocomplete.$el.style.transition = "transform 0.0s";
          }
          this.autocompleteActive = !!candidates?.length;
          if (!candidates?.length) {
            setTimeout(() => this.autocompleteEntries = candidates ?? [], 200);
          } else {
            this.autocompleteEntries = candidates ?? [];
          }
        } else {
          this.autocompleteActive = false;
        }
      },

      closeAutocomplete() {
        this.autocompleteActive = false;
        this.autocompleteEntries = [];
      },

      completeEmoji(emoji) {
        const sel = window.getSelection();
        let searchstr = sel.focusNode.textContent.slice(0, sel.focusOffset);
        searchstr = searchstr.slice(searchstr.lastIndexOf(":"));
        
        const range = sel.getRangeAt(0);
        sel.removeAllRanges();
        sel.addRange(range);
        range.setStart(sel.focusNode, sel.focusOffset - searchstr.length);
        document.execCommand("insertText", false, emoji.emoji);

        this.closeAutocomplete();
      },

      onKeyPress(e) {
        if (this.autocompleteActive) {
          switch (e.key) {
            case "ArrowUp": {
              ++this.$refs.autocomplete.selected;
              e.preventDefault();
              return false;
            };
            case "ArrowDown": {
              --this.$refs.autocomplete.selected;
              e.preventDefault();
              return false;
            };
            case "Tab":
            case "Enter": {
              this.completeEmoji(this.$refs.autocomplete.entries[this.$refs.autocomplete.selected]);
              e.preventDefault();
              return false;
            }
            case "Escape": {
              this.closeAutocomplete();
              e.preventDefault();
              return false;
            }
          }
        }
        return true;
      },

      onClick (e) {
        setImmediate(() => this.updateAutocomplete(this.$refs.textArea.range));
      }
    },
  }
</script>

<style scoped lang="scss">
  .chat-form-button {
    cursor: pointer;
    transition: 0.2s;
    color: yellow;
    margin-top: 7px;
    &:hover {
      filter: brightness(1.0) saturate(1.0);
    }
    &:not(:hover) {
      filter: brightness(0.8) saturate(0.0);
    }
  }

  .message-form {
    position: relative;
    background-color: transparent;

    @mixin smooth-transition() {
      background: linear-gradient(180deg, rgba(0,0,0,0) 0, map-get($greys, "200"));
      content: "";
      position: absolute;
      top: 0;
      height: .5rem;
      width: 16px;
    }

    &::before {
      @include smooth-transition;
      left: 0;
    }

    &::after {
      @include smooth-transition;
      right: 0;
    }
  }

  .gutter {
    @include ensure-height(1.6rem);
    font-size: .9em;

    & > * {
      display: inline;
    }
  }
</style>
