<template>
  <div>
    <div 
      class="text-area" 
      contenteditable="true"
      @keydown="handleKeyDown"
      @keypress="handleKeyPress"
      @click="handleClick"
      @paste="handlePaste"
      @input="handleInput"
      ref="area">
    </div>
    <span class="placeholder" v-if="!value.length">{{placeholder}}</span>
  </div>
</template>

<style scoped lang="scss">
.text-area {
  display: block;
  min-height: 40px;
  & ::v-deep div {
    padding-top: 8px;
    padding-bottom: 8px;
    display: block;
    min-height: 40px;
  }
}

.placeholder {
  display: block;
  position: absolute;
  top: 0;
  margin-top: 7px;
  color: map-get($white, "darken");
  pointer-events: none;
}

::v-deep b {
  font-weight: 800;
}
</style>

<script>
import {getEmojiOffset} from './Chat/Emoji/common';
const sel = window.getSelection();

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
  name: "TextArea",

  props: {
    placeholder: {
      type: String,
      optional: true,
      default: "",
    },
    value: {
      type: String,
    },
  },

  data () {
    return {
      range: null,
      focusrange: null,
      internalvalue: "",
    }
  },

  methods: {
    correctDOM () {
      if (this.$refs.area.childNodes?.[0]?.tagName === "BR") {
        this.$refs.area.innerHTML = "";
      }
      if (this.$refs.area.childNodes?.[0]?.nodeType === 3) {
        const range = document.createRange();
        range.selectNode(this.$refs.area.childNodes[0]);
        const div = document.createElement("DIV");
        range.surroundContents(div);
        range.selectNodeContents(div);
        range.collapse();
        sel.removeAllRanges();
        sel.addRange(range);
      }
      if (this.$refs.area.childNodes?.[0]?.tagName !== "DIV") {
        const div = document.createElement("DIV");
        const p = document.createElement("P");
        p.style.display = "inline";
        p.style.marginTop = "auto";
        p.style.marginBottom = "auto";
        p.style.width = "1px";
        p.style.marginRight = "-1px";
        div.appendChild(p);
        this.$refs.area.appendChild(div);
        const range = document.createRange();
        range.setStart(div.childNodes[0], 0);
        range.setEnd(div.childNodes[0], 0);
        this.range = range;
        sel.removeAllRanges();
        sel.addRange(range);
      }
      this.updateValue();
    },

    handleKeyPress () {
      this.correctDOM();
    },

    handleInput (e) {
      this.correctDOM();
      for (const c of this.$refs.area.children) {
        for (const n of c.childNodes) {
          if (n.nodeType === 3) {
            const newtext = replaceEmojis(n.textContent, em => this.$emoji.byname[em], em => {
              const e = this.$emoji.byname[em];
              return `<img alt="${e.emoji}" src="/blank.png" class="emoji atlas" style="background-position: ${getEmojiOffset(this.$emoji.byname[em])};">`;
            }).replaceAll(this.$emoji.regex, em => {
              const e = this.$emoji.byemoji[em];
              return `<img alt="${e.emoji}" src="/blank.png" class="emoji atlas" style="background-position: ${getEmojiOffset(e)};">`;
            });
            if (newtext !== n.textContent) {
              const range = document.createRange();
              range.selectNode(n);
              range.deleteContents();
              const node = document.createElement("DIV");
              node.innerHTML = newtext;
              for (let i = node.childNodes.length - 1; i >= 0; --i) {
                range.insertNode(node.childNodes[i]);
              }
              range.collapse();
              sel.removeAllRanges();
              sel.addRange(range);
            }            
          }
        }

        this.$emit("input", this.internalvalue);
      }
    },

    handleKeyDown (e) {
      const range = sel.getRangeAt(0);
      if (e.key === "Backspace" && e.ctrlKey && range.startOffset !== range.endOffset) {
        range.deleteContents();
        range.collapse();
      }
      this.correctDOM();
      this.$emit("keydown", e);
    },

    handlePaste (e) {
      const data = (e.clipboardData ?? window.clipboardData).getData('text/plain');
      document.execCommand("insertText", false, data);
      this.correctDOM();
      e.preventDefault();
      return false;
    },

    handleClick (e) {
      this.$emit("click", e);
    },

    focus () {
      this.$refs.area.focus();
      sel.removeAllRanges();
      sel.addRange(this.focusrange);
    },

    updateValue () {
      let value = "";
      for (const c of this.$refs.area.children) {
        for (const n of c.childNodes) {
          if (n.nodeType === 3) {
            value += n.textContent;
          } else if (n.tagName === "IMG") {
            value += n.alt ?? "";
          } else {
            value += n.textContent;
          }
        }
      }
      this.internalvalue = value;
    }
  },

  watch: {
    value (newval) {
      if (newval === this.internalvalue) return;
      this.$refs.area.innerHTML = newval;
      this.correctDOM();
    },
  },

  mounted () {
    document.addEventListener("selectionchange", () => {
      if (sel.focusNode?.parentNode.parentNode === this.$refs.area) {
        this.range = sel.getRangeAt(0);
      } else if (sel.focusNode?.parentNode === this.$refs.area) {
        this.focusrange = sel.getRangeAt(0);
      }
    });
    this.correctDOM();
  }
}
</script>