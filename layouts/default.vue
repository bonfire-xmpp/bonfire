<template>
  <v-app dark>
    <SystemBar></SystemBar>
    <v-main>
      <v-navigation-drawer class="darkgrey" permanent app>
      </v-navigation-drawer>
      <v-toolbar class="darkgrey">
        <v-toolbar-title class="noselect">#channel</v-toolbar-title>
        <v-spacer/>
        <v-card>
        <v-text-field width="100" dense clearable hide-details solo flat prepend-inner-icon="mdi-magnify"/>
        </v-card>
      </v-toolbar>
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
