<template>
  <div class="move-window flex items-center bg-black-darken" style="height: 24px">
    <p class="brand">BONFIRE</p>
    <div class="flex-1"/>
    <button @click="minimize"><icon>mdi-window-minimize</icon></button>
    <button @click="maximizeToggle"><icon>mdi-window-maximize</icon></button>
    <button class="close" @click="close"><icon>mdi-close</icon></button>
  </div>
</template>

<script>
import Icon from "@/components/Icon";

  const {api} = window
  export default {
    components: {Icon},
    props: {
      light: Boolean,
      dark: Boolean,
    },
    methods: {
      close() { api.close() },
      maximizeToggle() { api.maximizeToggle() },
      minimize() { api.minimize() }
    }
  }
</script>

<style scoped lang="scss">
  $systembar-brand-left: 10px !default;

  button {
    height: 100%;
    width: $systembar-height;
    text-align: right;
    transition: 0.2s;
    //outline: none;
    & > * {
      @apply mx-auto
    }
  }

  button:hover {
    // TODO: replace placeholders with variables
    background: darken(white, 40%);
    &.close {
      background: lighten(red, 20%);
    }
  }

  .brand {
    &:before {
      content: "";
      display: inline-block;
      width: $systembar-brand-left;
    }

    font-weight: 1000;
    font-size: 14px;
    @apply text-grey-200
  }
</style>
