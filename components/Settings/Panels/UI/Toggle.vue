<template>
  <div class="mb-3 unselectable">

    <div class="d-flex align-center clickable">
      <div class="d-inline" @click="toggle">{{ name }}</div>
      <v-spacer class="align-self-stretch" @click="toggle"/>
      <v-switch :ripple="false" inset class="switch"
        v-model="storeValue"/>
    </div>

    <div class="toggle-group-subtitle">{{ subtitle }}</div>
  </div>
</template>

<script>
  import { SettingsStore } from "@/store/settings";

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
      },

      storeState: {
        type: String,
      },
      storeSetter: {
        type: String,
        required: false,
      },

      setting: {
        type: String,
      },

      storeNamespace: {
        type: String,
        required: false,
        default: undefined
      }
    },

    computed: {
      namespace() {
        return this.storeNamespace || SettingsStore.namespace;
      },

      stateName() {
        return SettingsStore.$states[this.setting] || this.storeState;
      },

      storeValue: {
        get()    { return this.$store.state[this.namespace][this.stateName]; },
        set(val) { this.$store.commit(`${this.namespace}/${this.storeSetter || 'SET_' + this.stateName}`, val); },
      }
    },

    methods: {
      toggle() {
        this.storeValue = !this.storeValue;
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
