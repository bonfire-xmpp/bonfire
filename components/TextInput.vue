<template>
<!-- Dummy scale is used to create a new stacking context for the fixed vertical scroll bar -->
  <div class="d-flex flex-grow-1 flex-shrink-1 rounded-lg grey-300 px-4 align-center" style="transform: scale(1)">
    <simplebar class="position-relative flex-grow-1 flex-shrink-1 py-2 w-100 narrow-scrollbar input d-flex">
      <text-area :value="value"
                 ref="input" 
                 @input="handleInput" 
                 @click="handleClick"
                 @keydown.enter="handleEnter"
                 :placeholder="placeholder"/>
    </simplebar>
    <div class="flex-shrink-0 align-self-start pl-4">
      <slot name="append"/>
    </div>
  </div>
</template>

<script>
export default {
  name: "TextInput",
  props: {
    placeholder: String,
    value: String,
  },

  methods: {
    focus () {
      this.$refs.input.focus();
    },
    
    handleClick (e) { this.$emit('click', e); },
    handleInput (e) { this.$emit('input', e); },
    handleEnter (e) {
      this.$emit('enter', e);
      e.preventDefault();
      return false;
    },
  },

  computed: {
    range () { return this.$refs.input.range; },
  },
}
</script>

<style scoped lang="scss">
.input {
  position: relative;
  max-height: 30vh;
  max-width: 100%;
  overflow-wrap: break-word;
  white-space: normal;
  bottom: 0;
  outline: none;
  &::v-deep img.emoji {
    transform: translateY(-2px);
  }
}

.input::v-deep .simplebar-vertical {
  position: fixed;
  right: 0;
}

::v-deep.input .simplebar-content {
  // anchor scroll to bottom of container
  &::after {
    display: block;
    height: 1px;
    margin-top: -1px;
    overflow-anchor: auto;
  }
  overflow-anchor: none;
  padding: 0 !important;
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
