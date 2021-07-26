<template>
  <div class="mb-3 unselectable">

    <div class="flex items-center">
      <div class="inline" @click="toggle">{{ name }}</div>
      <div class="self-stretch flex-grow" @click="toggle"/>
      <number-input class="n" :max="max" :min="min" v-model="storeValue"/>
    </div>

    <div class="toggle-group-subtitle">{{ subtitle }}</div>
  </div>
</template>

<script>
  import SettingsStore from "@/store/settings";
  import NumberInput from "@/components/NumberInput";

  export default {
    name: "Number",
    components: {NumberInput},
    props: {
      name: {
        type: String,
        required: true,
      },
      subtitle: {
        type: String,
        required: false,
      },

      min: Number, max: Number,

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
.n {
  margin-top: 5px;
  margin-bottom: 5px;
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
