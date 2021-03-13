<template>
  <div>
    <div class="w-100 d-flex clickable"
         @click="contract"
         @mouseenter="updateHover"
         @mouseleave="updateHover"
    >
      <slot name="header">
        <v-icon size="12px" :color="colorClass" :style="{ transform: chevronRotation }">mdi-chevron-right</v-icon>
        <span class="ml-1 mr-3 overline" :class="colorClass + '--text'">{{ title }}</span>
        <v-divider class="my-auto mr-2"/>
      </slot>
    </div>

    <div v-show="!contracted">
      <slot/>
    </div>

    <div v-show="contracted">
      <slot name="contracted"/>
    </div>
  </div>
</template>

<script>
  export default {
    name: "ContractibleList",
    props: {
      title: {
        type: String,
        required: true,
      },
    },

    data() {
      return {
        contracted: false,
        hover: false,
      }
    },

    computed: {
      chevronRotation() {
        return `rotate(${ this.contracted ? 0 : 90 }deg)`
      },

      colorClass() {
        return this.hover ? 'grey-900' : 'grey-700';
      }
    },

    methods: {
      contract() {
        this.contracted = !this.contracted;
        this.$emit(this.contracted ? 'contract' : 'expanded');
      },

      updateHover() {
        this.hover = !this.hover;
      },
    },
  }
</script>

<style scoped>
  .clickable > * {
    cursor: pointer;
  }
</style>
