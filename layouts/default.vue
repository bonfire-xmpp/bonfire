<template>
  <v-app dark>
    <div id="app" class="d-flex flex-column black">
      <system-bar v-if="displayTitlebar" dark/>
      <div :style="mainTitlebarCompensation" class="d-flex flex-row flex-nowrap">
        <side-bar/>
        <v-main class="d-flex flex-column">
          <v-container fluid style="height: 64px;" class="grey-100 d-flex flex-row align-start">
            <h1 class="align-self-center">{{this.$route.params.entity}}</h1>
            <v-spacer/>
            <div>
              <v-text-field
                @focus="resultsActive = true"
                single-line 
                dense 
                solo 
                hide-details 
                style="max-width: 300px;"
              ></v-text-field>
              <div style="position: fixed; left: 0px; top: 0px; width: 100vw; height: 100vh;" v-if="resultsActive" @click="resultsActive = false">
              </div>
              <v-card class="grey-100 pa-4 my-8" v-if="resultsActive">
                <h1>test</h1>
                <h1>test</h1>
                <h1>test</h1>
                <h1>test</h1>
                <h1>test</h1>
              </v-card>
            </div>
          </v-container>
          <nuxt class="d-flex flex-grow-1" width="200" style="height: 100%;"/>
        </v-main>
      </div>
    </div>
  </v-app>
</template>

<script>
  import SystemBar from "@/components/SystemBar";

  export default {
    layout: 'default',
    components: {SystemBar},
    data () {
      return {
        resultsActive: false,
      };
    },
    methods: {
      toggle() {
        this.resultsActive = !this.resultsActive;
      }
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
    }
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

