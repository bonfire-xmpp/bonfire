<template>
  <div class="mb-3 unselectable">

    <div class="d-flex align-center clickable">
      <div class="d-inline" @click="toggle">{{ name }}</div>
      <v-spacer class="align-self-stretch" @click="toggle"/>
      <v-switch :ripple="false" inset class="switch"
        v-model="state"/>
    </div>

    <div class="toggle-group-subtitle">{{ subtitle }}</div>
  </div>
</template>

<script>
  export default {
    name: "Toggle",
    props: {
      name: {
        type: String,
        required: true,
      },
      subtitle: {
        type: String,
        required: false,
      }
    },

    data() {
      return {
        state: false,
      }
    },

    methods: {
      toggle() {
        // TODO: change vuex store state
        this.state = !this.state;
      }
    },
  }
</script>

<style scoped lang="scss">
.switch {
  display: inline;
  margin: 0;
}

.toggle-group-subtitle {
  font-weight: 300;
  font-size: .9em;
  color: map-get($greys, "700");
}

*::v-deep .v-messages {
  @include ensure-width(0);
  @include ensure-height(0);
  width: 0 !important;
  height: 0 !important;
}
</style>
