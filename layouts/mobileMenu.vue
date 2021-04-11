<template>
  <v-app dark>
    <div id="app" class="d-flex flex-column black">
      <header-bar class="align-content-center-inline unselectable header">
        <v-btn icon @click="$router.back();" class="mx-2">
          <v-icon size="1.66em" color="white">mdi-arrow-left</v-icon>
        </v-btn>
        <span class="header-title white--text">{{title}}</span>
      </header-bar>
      <v-main>
        <nuxt class="pt-1"/>
      </v-main>
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

  .header { z-index: 2; }

  .header-title {
    font-weight: 800;
    font-size: 1.2em;
    vertical-align: sub !important;
  }
</style>

<script>
  import SystemBar from "@/components/SystemBar";
  import {Store} from "@/store";

  export default {
    layout: 'default',
    components: {SystemBar},
    computed: {
      title() {
        return this.$store.state[Store.$states.pageTitle];
      }
    }
  }
</script>
