<template>
  <form @submit.prevent="emitMessage"
        class="px-4 message-form mt-n2">
    
    <v-textarea solo flat dense
                no-resize hide-details single-line
                auto-grow :rows="1"
                background-color="grey-300"
                v-model="message"
                :placeholder="label"
                ref="textArea"
                @keydown="keypress">
      <template #append>
        <overlay-menu class="ma-0" v-if="!$device.isMobileOrTablet">
          <template #activator="{ on }">
            <v-icon class="chat-form-button" @click="on">mdi-emoticon</v-icon>
          </template>
          <template #default="{ off }">
            <emoji-chooser style="height: 380px !important;" @insert-emoji="insertEmoji($event); off()"></emoji-chooser>
          </template>
        </overlay-menu>
        <span v-else>
          <v-icon class="chat-form-button" @click="$refs.emojiDialog.open()">mdi-emoticon</v-icon>
          <bottom-sheet ref="emojiDialog">
            <emoji-chooser @insert-emoji="insertEmoji($event); $refs.emojiDialog.close()"></emoji-chooser>
          </bottom-sheet>
        </span>
      </template>
    </v-textarea>
    <div class="gutter white--text d-flex flex-row align-center">
      <slot/>
    </div>
  </form>
</template>

<script>
  import EmojiChooser from "@/components/Chat/Emoji/EmojiChooser";
  import OverlayMenu from "@/components/OverlayMenu";

  export default {
    name: "ChatMessageForm",
    components: { EmojiChooser, OverlayMenu },

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
      }
    },

    methods: {
      keypress(e) {
        if(e.which === 13 && !e.shiftKey) {
          e.preventDefault();
          this.emitMessage();
        } else {
          this.change();
        }
      },

      emitMessage() {
        if (!this.message.length) return;
        this.$emit('message', this.message);
        this.message = '';
      },

      change() {
        // Start composing on start edge
        if(!this.composingTimeout) {
          this.$emit('composing');
          console.log('composing')
        }

        // Debounce
        clearTimeout(this.composingTimeout);
        this.composingTimeout = setTimeout(() => {
          this.composingTimeout = undefined;
          console.log('paused')
          this.$emit('paused');
        }, 2000);

        // TODO: v-textarea doesn't have HTML contents for whatever reason,
        //       so twemoji.parse cannot replace emoji glyphs with images
        //       this may require a rewrite of v-textarea unfortunately
        // twemoji.parse(this.$refs.textArea.$el);
      },

      insertEmoji (emoji) {
        this.message += emoji;
      },
    },
  }
</script>

<style scoped lang="scss">
  .chat-form-button {
    cursor: pointer;
    transition: 0.2s;
    color: yellow;
    margin-top: 6px;
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
