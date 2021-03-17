<template>
  <div class="header position-relative"
       :style="styling"
       :class="{ 'lighten-on-hover': lightenOnHover, 'mb-2': padBottom }">
    <slot/>
  </div>
</template>

<script>
  export default {
    name: "HeaderBar",
    props: {
      backgroundColor: {
        type: String,
        optional: true,
        default: "",
      },
      color: {
        type: String,
        optional: true,
        default: "",
      },
      lightenOnHover: {
        type: Boolean,
        optional: true,
        default: false,
      },
      padBottom: {
        type: Boolean,
        optional: true,
        default: false,
      },
    },

    computed: {
      styling() {
        return this.backgroundColor ? `background-color: ${this.backgroundColor};` : '' +
               this.color           ? `color:                      ${this.color};` : '';
      }
    }
  }
</script>

<style scoped lang="scss">
  @import "~assets/utilities.scss";

  .header {
    @include ensure-height(48px);
    @extend .light-shadow;
  }
</style>
