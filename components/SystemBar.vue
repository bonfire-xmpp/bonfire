<template>
  <v-system-bar :light="light" :dark="dark" class="move-window pa-0 d-flex align-center">
    <p class="ma-0 brand">BONFIRE</p>
    <v-spacer/>
    <button @click="minimize"><v-icon>mdi-window-minimize</v-icon></button>
    <button @click="maximizeToggle"><v-icon>mdi-window-maximize</v-icon></button>
    <button class="close" @click="close"><v-icon>mdi-close</v-icon></button>
  </v-system-bar>
</template>

<script>
  const {api} = window
  export default {
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
    outline: none;
  }

  button:hover {
    // TODO: replace placeholders with variables
    background: darken(white, 40%);
    &.close {
      background: lighten(red, 20%);
    }
  }

  .brand {
    font-weight: 1000;
    font-size: 14px;
    &:before {
      content: "";
      display: inline-block;
      width: $systembar-brand-left;
    }
  }
</style>
