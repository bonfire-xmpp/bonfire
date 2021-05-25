<template>
  <div class="header position-relative d-flex align-center"
       :style="styling"
       :class="{ 'lighten-on-hover': lightenOnHover, 'mb-2': padBottom, 'pl-4 pr-4': !mobile }">
    <v-btn v-if="mobile && menu" icon @click="back" class="mx-2">
      <v-icon size="1.66em" color="white">mdi-menu</v-icon>
    </v-btn>
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
      mobile: {
        type: Boolean,
        optional: true,
        default: false,
      },
      menu: {
        type: Boolean,
        optional: true,
        default: false,
      }
    },

    computed: {
      styling() {
        return this.backgroundColor ? `background-color: ${this.backgroundColor};` : '' +
               this.color           ? `color:`          +         `${this.color};` : '';
      }
    },

    methods: {
      back() {document.querySelector('#bonfire > .main-container').scroll({left:0, behavior:'smooth'})}
    },
  }
</script>

<style scoped lang="scss">
  @import "~assets/utilities.scss";

  .header {
    @include ensure-height(48px);
    @extend .light-shadow;
  }
</style>
