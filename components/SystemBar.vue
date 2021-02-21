<template>
  <v-system-bar class="grey lighten-2" light app fixed id="systembar">
    <button class="systembar-btn systembar-closebtn" @click="close"><v-icon>mdi-close</v-icon></button>
    <button class="systembar-btn" @click="maximizeToggle"><v-icon>mdi-window-maximize</v-icon></button>
    <button class="systembar-btn" @click="minimize"><v-icon>mdi-window-minimize</v-icon></button>
    <p id="systembar-brand">BONFIRE</p>
  </v-system-bar>
</template>

<script>
const {api} = window
export default {
  methods: {
    close() { api.close() },
    maximizeToggle() { api.maximizeToggle() },
    minimize() { api.minimize() }
  }
}
</script>

<style lang="sass">
.v-system-bar
  -webkit-app-region: drag
  -webkit-user-select: none
  direction: rtl
  padding: 0px
  & button
    padding: 0px
    margin: 0px
    -webkit-app-region: no-drag
.systembar-btn
  outline: none
  height: 24px
  width: 24px
  text-align: right
  padding: 0px
  margin: 0px
  -webkit-transition: 0.2s
  &:hover
    background: darken(white, 40%)
.systembar-closebtn:hover
    background: lighten(red, 20%)
#systembar-brand
  position: absolute
  display: block
  float: left
  left: 10px
  vertical-align: middle
  font-weight: 400
  margin: 0
  padding: 0
</style>