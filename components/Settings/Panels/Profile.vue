<template>
  <div class="white--text">
    <panel-title v-if="!mobile">Profile</panel-title>

    <number class="number" setting="resourcePriority" name="Resource Priority" subtitle="Ranks your current client session against your other clients. A negative value means servers will avoid delivering message to this client."/>
  </div>
</template>

<script>
  import PanelTitle from "./UI/PanelTitle";
  import Number from "./UI/Number";

  export default {
    name: "profile",
    components: {PanelTitle, Number},
    props: ['mobile'],
  }
</script>

<style scoped lang="scss">
.number::v-deep * { border-color: map-get($greys, "500") !important; }
</style>
