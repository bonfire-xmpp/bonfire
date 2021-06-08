<template>
<!-- Dummy scale is used to create a new stacking context for the fixed vertical scroll bar -->
  <div class="d-flex w-100 rounded-lg grey-300 px-4" style="transform: scale(1)">
    <simplebar class="position-relative flex-grow-1 py-2 narrow-scrollbar input d-flex">
      <div contenteditable="true"
           @input="onInput"
           @blur="setData(getData())"
           @click="onClick"
           @paste="onPaste"
           @keypress="onKeypress"
           class="position-relative flex-grow-1"
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
import {getEmojiOffset} from './Chat/Emoji/common';
import insertTextAtCursor from 'insert-text-at-cursor';

function replaceEmojis(intext, cond, func) {
  let started = false,
      ei = 0, 
      text = intext.slice();
  for (let i = text.length - 1; i >= 0; --i) {
    if (started) {
      if (text[i] === ':') {
        const emojiName = text.slice(i + 1, ei);
        if (cond(emojiName)) {
          const before = text.slice(0, i),
                after = text.slice(ei + 1),
                newtext = before + func(emojiName) + after;
          text = newtext;
          started = false;
        } else {
          ei = i;
          started = true;
        }
      }
    } else if (text[i] === ':') {
      ei = i;
      started = true;
    }
  }
  return text;
}

export default {
  name: "TextInput",
  props: {
    placeholder: String,
    value: String,
  },

  data () {
    return {
      range: null,
    };
  },

  methods: {
    getData() {
      const input = this.$refs.input.cloneNode(true);

      for (let i = 0; i < input.children.length;) {
        const child = input.children[0];
        if (child.tagName === "IMG") {
          child.outerHTML = child.getAttribute("alt");
        } else {
          ++i;
        }
      }

      input.innerHTML = input.innerHTML.replace(/<br>$/, "");
      return input.innerHTML;
    },

    setData(value) {
      let len = 0;
      const replaced = value.replaceAll(
        this.$emoji.regex, 
        ec => {
              const e = this.$emoji.byemoji[ec];
              len += ec.length - 1;
              if (!e) return ec;
              return `<img alt="${ec}" src="/empty.png" class="emoji atlas" style="background-position: ${getEmojiOffset(e)};">`;
        });
      // subtract all emojis that are already substituted as images,
      // as they are already factored into the caret position 
      for (const child of this.$refs.input.children) {
        if (child.tagName === "IMG") {
          len -= child.getAttribute("alt").length - 1;
        }
      }

      const changed = replaced === this.$refs.input.innerHTML;

      if (!changed) {
        const pos = this.getCaretPosition() - len;
        this.$refs.input.innerHTML = replaced;
        this.setCaretPosition(pos);
      }
      if (window.getSelection().rangeCount) 
        this.range = window.getSelection().getRangeAt(0);
      if (changed) this.$emit('input', this.getData());
    },

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
      const range = document.createRange();
      let node = this.$refs.input.childNodes[0];
      let total = pos;
      
      while (node) {
        if (node.nodeType === 3) {
          if (total < node.length) {
            range.setStart(node, total);
            range.setEnd(node, total);
            sel.removeAllRanges();
            sel.addRange(range);
            return;
          }
          total -= node.length;
        } else {
          if (total <= 1) {
            range.setStartAfter(node);
            range.setEndAfter(node);
            sel.removeAllRanges();
            sel.addRange(range);
            return;
          }
          total -= 1;
        }
        if (!node.nextSibling) {
          range.setStartAfter(node);
          range.setEndAfter(node);
          return;
        }
        node = node.nextSibling;
      }
    },

    insertText(text) { insertTextAtCursor(this.$refs.input, text); },

    onPaste(e) {
      e.preventDefault();
      const text = (e.originalEvent || e).clipboardData.getData('text/plain');
      this.insertText(text);
    },

    onClick(e) {
      this.$emit("text-click", e);
    },

    onKeypress(e) {
      if(e.key === 'Enter') {
        if(e.shiftKey) {
          e.preventDefault();
          this.insertText('\n');
          this.$emit('enter:shift');
        } else {
          e.preventDefault();
          this.$emit('enter');
        }
      }
      this.$emit('keypress', e);
    },
    onInput({ data }) {
      const curdata = this.getData();
      if (this.$emoji.regex.test(data)) {
        this.$nextTick(() => this.setData(curdata));
      } else {
        if (window.getSelection().rangeCount) 
          this.range = window.getSelection().getRangeAt(0);
        this.$emit('input', curdata);
      }
    },
  },

  mounted() { 
    document.onselectionchange = () => {
      if (window.getSelection().rangeCount <= 0) return;
      const range = window.getSelection().getRangeAt(0);
      if (range.commonAncestorContainer == this.$refs.input) {
        this.range = range;
      }
    };
    this.range = document.createRange();
    this.$refs.input.appendChild(document.createTextNode(""));
    this.range.setStart(this.$refs.input.childNodes[0], 0);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(this.range);
    this.setData(this.value ?? ''); 
    
  },
  watch: {
    value(newValue) {
      if(this.getData() !== newValue)
        this.setData(newValue ?? '');
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
    transform: translateY(-2px);
  }
}

.input::v-deep .simplebar-vertical {
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
