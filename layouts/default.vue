<template>
  <v-app dark>
    <v-system-bar class="gray" light app fixed id="systembar">
      <button class="systembar-btn systembar-closebtn" @click="close"><v-icon>mdi-close</v-icon></button>
      <button class="systembar-btn" @click="maximizeToggle"><v-icon>mdi-window-maximize</v-icon></button>
      <button class="systembar-btn" @click="minimize"><v-icon>mdi-window-minimize</v-icon></button>
      <p id="systembar-title">Bonfire</p>
    </v-system-bar>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<style lang="sass">
html
  overflow: hidden !important

*
  font-family: Merriweather

.v-system-bar
  -webkit-app-region: drag
  -webkit-user-select: none
  direction: rtl
  box-shadow: 0px 0px 4px black
  text-shadow: 0px 0px 4px lighten(black, 80%)
  & button
    -webkit-app-region: no-drag
.systembar-btn
  outline: none
  height: 24px
  width: 24px
  text-align: right
  &:hover
    background: darken(white, 40%)
.systembar-closebtn:hover
    background: lighten(red, 20%)
#systembar-title
  position: absolute
  display: block
  float: left
  left: 10px
  vertical-align: middle
  font-weight: 600
  margin: 0
  padding: 0
</style>

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
