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
          
          :entries="autocompleteEntries"
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
        message: "",
        composingTimeout: null,

        autocompleteActive: false,
        autocompleteEntries: [],
      }
    },

    methods: {
      emitMessage() {
        if (!this.message.length) return;
        this.$emit('message', this.message);
        this.message = '';
      },

      change(data) {
        // Start composing on start edge
        if(!this.composingTimeout) {
          this.$emit('composing');
          this.range = window.getSelection().getRangeAt(0);
        }

        // Update autocomplete state
        this.updateAutocomplete(data);

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
        this.$refs.textArea.insertText(emoji);
      },

      updateAutocomplete(data) {
        const searchstr = data.slice(0, this.$refs.textArea.getCaretPosition() + 1);

        const match = searchstr.match(/:([^\s:]{2,})$/);
        if (match) {
          const candidates = 
            this.$emoji.searchmap[match[1].slice(0, 2)]
            ?.filter(({ name }) => name.split("_").some(x => x.startsWith(match[1])));

          const wasactive = this.autocompleteActive;
          if (candidates?.length) {
            this.$nextTick(() => {
              const autocomplete = this.$refs.autocomplete;
              if (!autocomplete) return;
              const areaRect = this.$refs.textArea.$el.getBoundingClientRect();
              const leftA = areaRect.left;
              const leftB = window.getSelection().getRangeAt(0).getBoundingClientRect().left;

              let offset = Math.min(Math.max(0, leftB - leftA - 280/2), this.$refs.textArea.$el.clientWidth - 280);
              autocomplete.$el.style.transform = `translateX(${offset}px)`;

              if (!wasactive)
                setImmediate(() => autocomplete.$el.style.transition = "transform 0.2s");
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
        const searchstr = this.$refs.textArea.getData().slice(0, this.$refs.textArea.getCaretPosition() + 1);
        const length = searchstr.length - searchstr.lastIndexOf(":");

        const sel = window.getSelection();

        sel.removeAllRanges();
        const range = this.$refs.textArea.range;
        sel.addRange(range);
        range.setStart(range.startContainer, Math.max(0, range.startOffset - length));
        this.$refs.textArea.insertText(emoji.emoji);

        this.closeAutocomplete();
      },

      onKeyPress(e) {
        if (e.key === "ArrowUp") {
          if (this.autocompleteActive) ++this.$refs.autocomplete.selected;
          e.preventDefault();
          return false;
        } else if (e.key === "ArrowDown") {
          if (this.autocompleteActive) ++this.$refs.autocomplete.selected;
          e.preventDefault();
          return false;
        } else if (e.key === "Tab") {
          this.completeEmoji(this.$refs.autocomplete.entries[this.$refs.autocomplete.selected]);
          e.preventDefault();
          return false;
        }
        return true;
      },

      onClick (e) {
        setImmediate(() => this.updateAutocomplete(this.$refs.textArea.getData()));
      }
    },
  }
</script>

<style scoped lang="scss">
  .chat-form-button {
    cursor: pointer;
    transition: 0.2s;
    color: yellow;
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

  *::v-deep .v-text-field__slot {
    & textarea::placeholder {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

  ::v-deep .v-input__append-inner {
    margin: 0 !important;
    padding: 0 !important;
    min-height: 38px;
    min-height: 38px;
    align-self: stretch !important;
    // background: red;
    & > * {
      // width: 32px;
      // height: 32px;
      // margin-top: 3px;
      // margin-bottom: 3px;
    }
  }

  ::v-deep .bottom-sheet__card.fx-default {
    background: map-get($greys, "100") !important;
    margin-left: 0;
    margin-right: 0;
  }

  ::v-deep .bottom-sheet__content > .v-list:first-child {
    margin-bottom: 0 !important;
    margin-top: 0 !important;
    height: 100% !important;
  }
</style>
