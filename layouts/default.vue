<template>
  <v-app dark>
    <div id="app" class="d-flex flex-column">
      <system-bar dark/>
      <div id="main" class="d-flex">
        <side-bar/>
        <v-main>
          <nuxt/>
        </v-main>
      </div>
    </div>
  </v-app>
</template>

<style lang="scss">
  #main {
    height: calc(100vh - #{$systembar-height});
  }
</style>

<script>
  import SystemBar from "@/components/SystemBar";

  export default {
    layout: 'default',
    components: {SystemBar}
  }
</script>
