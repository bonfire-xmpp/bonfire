<template>
  <v-app dark>
    <div id="app" class="d-flex flex-column">
      <system-bar v-if="displayTitlebar" dark/>
      <div :style="mainTitlebarCompensation" class="d-flex">
        <side-bar/>
        <v-main>
          <nuxt/>
        </v-main>
      </div>
    </div>
  </v-app>
</template>

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

<script>
  import SystemBar from "@/components/SystemBar";

  export default {
    layout: 'default',
    components: {SystemBar},
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
    }
  }
</script>
