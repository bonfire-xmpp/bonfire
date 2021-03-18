<template>
  <form @submit.prevent="emitMessage"
        class="px-4 message-form mt-n2">
    <v-textarea solo flat dense
                no-resize hide-details single-line
                auto-grow :rows="1"
                background-color="grey-300"
                append-icon="mdi-send"
                v-model="message"
                @keydown="keypress"/>
    <div class="gutter white--text">
      <slot/>
    </div>
  </form>
</template>

<script>
  export default {
    name: "ChatMessageForm",

    data() {
      return {
        message: "",
      }
    },

    methods: {
      keypress(e) {
        if(e.which === 13 && !e.shiftKey) {
          e.preventDefault();
          this.emitMessage();
        }
      },

      emitMessage() {
        if (!this.message.length) return;
        this.$emit('message', this.message);
        this.message = '';
      }
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
    @include ensure-height(1.5rem);
    font-size: .9rem;
  }
</style>
