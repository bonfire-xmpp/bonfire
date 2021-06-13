<template>
  <div class="autocomplete d-flex flex-column-reverse flex-nowrap black rounded" @mousedown="submit">
    <span v-for="(entry, i) of entries" :key="i" 
          :class="{ 'selected': i === selected, 'entry': true, }" 
          @mousemove="selected = i">
      <span class="emoji atlas unselectable" :style="{ 'background-position': getEmojiOffset(entry) }"/>
      <span class="unselectable">:{{entry.name}}:</span>
    </span>
  </div>
</template>

<style scoped lang="scss">
.autocomplete {
  position: fixed;
  bottom: 50px;
  left: 0;
  width: 280px;
  height: fit-content;
  margin: 0;
  padding-top: 4px;
  padding-bottom: 4px;
  overflow: hidden;

  & > .entry {
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
    align-items: center;

    margin: 2px;
    margin-left: 4px;
    margin-right: 4px;
    padding: 4px;
    
    & > * {
      margin-right: 8px;
    }

    &.selected {
      background: map-get($black, "lighten");
    }
  }
}
</style>

<script>
import * as Common from "./common";

const mod = (x, m) => ((x%m)+m)%m;

export default {
  name: "Autocomplete",

  data () {
    return {
      selected: 0,
    };
  },

  watch: {
    selected () {
      this.selected = mod(this.selected, this.entries.length);
    },
    entries () {
      // only clamp to upper bound
      this.selected = Math.min(this.selected, this.entries.length - 1);
    },
  },

  methods: { 
    submit () {
      this.$emit("submit", this.entries[this.selected]);
    },

    ...Common
  },

  props: {
    entries: {
      type: Array,
      optional: true,
      default: []
    },
  },
};
</script>