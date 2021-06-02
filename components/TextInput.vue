<template>
<!-- Dummy scale is used to create a new stacking context for the fixed vertical scroll bar -->
  <div class="d-flex w-100 rounded-lg grey-300 px-4" style="transform: scale(1)">
    <simplebar class="position-relative flex-grow-1 py-2 narrow-scrollbar input d-flex">
      <div contenteditable="true"
           @input="update"
           @blur="update"
           @paste="onPaste"
           @keypress="onKeypress"
           class="position-relative flex-grow-1"
           style="z-index: 2"
           ref="input">
      </div>
      <div class="position-absolute my-2 unselectable grey-700--text" style="top:0; z-index: 1"
           v-if="!data">{{placeholder}}</div>
    </simplebar>
    <div class="flex-shrink-0 align-self-start pt-2">
      <slot name="append"/>
    </div>
  </div>
</template>

<script>
import twemoji from 'twemoji';
export default {
  name: "TextInput",
  props: {
    placeholder: String,
    value: String,
  },
  data() {
    return {
      data: ""
    }
  },
  methods: {
    update() {
      this.data = this.$refs.input.innerText;
    },

    onPaste(e) {
      e.preventDefault();
      const text = (e.originalEvent || e).clipboardData.getData('text/plain');
      window.document.execCommand('insertText', false, text);
    },

    onKeypress(e) {
      if(e.key === 'Enter') {
        if(e.shiftKey) {
          this.$emit('enter:shift');
        } else {
          e.preventDefault();
          this.$emit('enter');
        }
      }
      this.$emit('keypress', e);
    }
  },
  watch: {
    data() {
      twemoji.parse(this.$refs.input);
      this.$emit('input', this.data)
    }
  },
}
</script>

<style scoped lang="scss">
.input {
  max-height: 30vh;
  max-width: 100%;
  overflow-wrap: break-word;
  white-space: normal;
  //@include ensure-width(100%);

  outline: none;
  //overflow: hidden;
}

*::v-deep .simplebar-vertical {
  position: fixed;
  right: 0;
}

// TODO: fix the way they break line height
*::v-deep img.emoji {
  height: 1em;
  width: 1em;
  margin: 0 .05em 0 .1em;
  vertical-align: -0.1em;
}
</style>
