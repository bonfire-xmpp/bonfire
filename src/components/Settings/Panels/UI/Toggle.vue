<template>
  <div class="mb-3 unselectable">

    <div class="flex align-center clickable">
      <div class="inline" @click="toggle">{{ name }}</div>
      <div class="flex-grow align-self-stretch" @click="toggle"/>
      <ion-toggle inset class="switch" mode="ios" v-model="storeValue"/>
    </div>

    <div class="toggle-group-subtitle">{{ subtitle }}</div>
  </div>
</template>

<script>
  import SettingsStore from "@/store/settings";
  import { IonToggle } from '@ionic/vue';

  export default {
    name: "Toggle",
    components: {IonToggle},
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
ion-toggle {
  --handle-spacing: 0px;
  height: 30px;
}

ion-toggle::part(handle) {
  transition: all .3s !important;
}

ion-toggle.toggle-checked::part(handle) {
  width: 100%;
}

.switch {
  display: inline;
  margin: 0;
}

.toggle-group-subtitle {
  font-weight: 300;
  font-size: .9em;
  color: map-get($greys, "700");
}
</style>
