<template>
  <v-app dark v-if="stanzaInitialized">
    <div id="app" class="d-flex flex-column black">
      <system-bar v-if="displayTitlebar" dark class="grey-100 material-shadow" style="z-index: 11;"/>
      <div :style="mainTitlebarCompensation" class="d-flex flex-row flex-nowrap">
        <side-bar class="no-select material-shadow"/>
        <v-main class="flex-grow-1">
          <nuxt style="position: absolute; width: 100%; height: 100%;"/>
        </v-main>
      </div>
    </div>
  </v-app>
</template>

<script>
import SystemBar from "@/components/SystemBar";
import { Store } from "@/store";
import { mapState } from "vuex";

export default {
  layout: 'default',
  components: {SystemBar},
  methods: {
  },
  computed: {
    displayTitlebar() {
      return !!window.api;
    },
    mainTitlebarCompensation() {
      // TODO: Sass <=> JS variable interop is, at best, undocumented.
      // TODO: A Nuxt module that both generates Sass variables and injects them into the context would be required here
      // TODO: $systembar-height
      return this.displayTitlebar ? 'height: calc(100vh - 24px);' : 'height: 100vh;';
    },
    stanzaInitialized () {
      return this.$store.state[Store.$states.stanzaInitialized];
    },
  },
}
</script>

<style lang="scss">
  #app {
    // Ensures the app container takes up just one screenful
    position: absolute;
    width: 100vw;
    height: 100vh;

    // Clips out everything that doesn't fit in the container
    overflow: hidden;

    // Solves some edge cases where on reload/HMR the view is stuck scrolled halfway
    left: 0;
    top: 0;
  }
</style>

