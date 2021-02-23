<template>
  <v-app dark>
    <div id="app">
      <system-bar dark/>
      <div id="main">
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
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  left: 0px;
  top: 0px;
  width: 100vw;
  height: 100vh;
  padding: 0px;
}
#main {
  position: relative;
  display: flex;
  flex-flow: column wrap;
  align-items: flex-start;
  width: 100%;
  height: 100%;
  padding-bottom: $systembar-height;
}

::-webkit-scrollbar {
  width: 5px;
  background: none;
}
::-webkit-scrollbar-thumb {
  background: #282828;
  border-radius: 10px;
}
</style>

<script>
  import SystemBar from "@/components/SystemBar";

  export default {
    layout: 'default',
    components: {SystemBar}
  }
</script>
