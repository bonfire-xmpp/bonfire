<template>
  <v-app dark>
    <SystemBar></SystemBar>
    <v-main>
      <nuxt/>
    </v-main>
  </v-app>
</template>

<style lang="sass">
html
  overflow: hidden !important
*
  font-family: "Mukta"
.darkgrey
  background: #121212 !important
.noselect
  -webkit-user-select: none
</style>

<script>
export default {
}
</script>
