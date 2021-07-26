<template>
  <form @submit.prevent="emitMessage"
        class="px-4 message-form mt-n2">
    <v-textarea solo flat dense
                no-resize hide-details single-line
                auto-grow :rows="1"
                background-color="grey-300"
                append-icon="mdi-send"
                v-model="message"
                :placeholder="label"
                @keydown="keypress"/>
    <div class="gutter text-white flex flex-row align-center">
      <slot/>
    </div>
  </form>
</template>

<script>
  export default {
    name: "ChatMessageForm",

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
        }

        // Debounce
        clearTimeout(this.composingTimeout);
        this.composingTimeout = setTimeout(() => {
          this.composingTimeout = undefined;
          this.$emit('paused');
        }, 2000);
      },
    },
  }
</script>

<style scoped lang="scss">
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
</style>
