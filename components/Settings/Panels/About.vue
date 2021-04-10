<template>
  <div class="white--text">
    <panel-title v-if="!mobile">About</panel-title>
  </div>
</template>

<script>
  import PanelTitle from "./UI/PanelTitle";

  export default {
    name: "about",
    components: {PanelTitle},
    props: ['mobile'],
  }
</script>

<style scoped>

</style>
