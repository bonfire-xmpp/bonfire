<template>
<!-- Dummy scale is used to create a new stacking context for the fixed vertical scroll bar -->
  <div class="d-flex w-100 rounded-lg grey-300 px-4" style="transform: scale(1)">
    <simplebar class="position-relative flex-grow-1 py-2 narrow-scrollbar input d-flex">
      <div contenteditable="true"
           @input="update"
           @blur="update"
           @paste="onPaste"
           @keypress="onKeypress"
           class="position-relative flex-grow-1 body-1"
           style="z-index: 2; white-space: pre-wrap;"
           ref="input"/>
      <div class="position-absolute my-2 unselectable grey-700--text" style="top:0; z-index: 1"
           v-if="!value">{{placeholder}}</div>
    </simplebar>
    <div class="flex-shrink-0 align-self-start pt-2">
      <slot name="append"/>
    </div>
  </div>
</template>

<script>
import twemoji from 'twemoji';
import {getEmojiOffset} from './Chat/Emoji/common';

const emojiNameRegex = new RegExp(":(.*?):", "g");

export default {
  name: "TextInput",
  props: {
    placeholder: String,
    value: String,
  },

  methods: {
    getData() {
      const input = this.$refs.input.cloneNode(true);

      while (input.children.length) {
        const child = input.children[0];
        if (child.tagName === "IMG")
          child.outerHTML = child.getAttribute("alt");
        else child.remove();
      }

      return input.innerText;
    },
    setData(v) { this.$refs.input.innerText = v; },

    getCaretPosition() {
      const sel = window.getSelection();
      let total = 0;
      let node = sel.getRangeAt(0).startContainer;
      total += sel.getRangeAt(0).startOffset;
      while ((node = node.previousSibling)) {
        if (node.nodeType === 3) {
          total += node.length;
        } else {
          total += 1;
        }
      }
      return total;
    },

    setCaretPosition(pos) {
      const sel = window.getSelection();
      const range = sel.getRangeAt(0);
      let node = this.$refs.input.childNodes[0];
      let total = pos;
      
      while (node) {
        if (node.nodeType === 3) {
          if (total < node.length) {
            range.setStart(node, total);
            range.setEnd(node, total);
            return;
          }
          total -= node.length;
        } else {
          if (total < 1) {
            range.setStartAfter(node);
            range.setEndAfter(node);
            return;
          }
          total -= 1;
        }
        node = node.nextSibling;
      }
    },

    update() {
      let len = 0;
      const replaced =
          this.getData().replace(
            emojiNameRegex,
              (match, u) => {
                const e = this.$emoji.byname[u];
                if (e) {
                  // add all emojis that don't exist yet
                  len += match.length;
                  return `<img alt="${match}" src="/empty.png" class="emoji atlas" style="background-position: ${getEmojiOffset(e)};">`;
                }
                return match;
              });
      // subtract all emojis that already exist as images
      for (const child of this.$refs.input.children) {
        len -= child.getAttribute("alt")?.length || 0;
      }
      const pos = this.getCaretPosition() - len;

      if(replaced !== this.$refs.input.innerHTML)
        this.$refs.input.innerHTML = replaced;

      this.setCaretPosition(pos);

      this.$emit('input', this.getData());
    },

    onPaste(e) {
      e.preventDefault();
      const text = (e.originalEvent || e).clipboardData.getData('text/plain')
          .replaceAll(
              this.$emoji.regex,
              u => {
                const e = this.$emoji.byemoji[u]?.name;
                return e ? ':'+e+':' : u;
              });
      window.document.execCommand('insertText', false, text);
    },

    onKeypress(e) {
      if(e.key === 'Enter') {
        if(e.shiftKey) {
          e.preventDefault();
          window.document.execCommand('insertText', false, '<br>');
          this.$emit('enter:shift');
        } else {
          e.preventDefault();
          this.$emit('enter');
        }
      }
      this.$emit('keypress', e);
    },
  },

  mounted() { this.setData(this.value ?? ''); },
  watch: {
    value(newValue, oldValue) {
      if(this.getData() !== newValue)
        this.setData(newValue ?? '');
      // this.$nextTick(this.update)
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
  &::v-deep img.emoji {
    transform: translateY(-1px);
  }
}

*::v-deep .simplebar-vertical {
  position: fixed;
  right: 0;
}

// TODO: fix the way they break line height
*::v-deep img.emoji {
//  height: 1em;
//  width: 1em;
//  margin: 0 .05em 0 .1em;
  vertical-align: middle;
  text-indent: 100%;
  white-space: nowrap;
  overflow: hidden;
}
</style>
