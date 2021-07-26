<template>
  <div>
    <div class="w-100 flex clickable unselectable"
         @click="contract"
         @mouseenter="updateHover"
         @mouseleave="updateHover"
    >
      <slot name="header">
        <icon size="12px" :color="colorClass" :style="{ transform: chevronRotation }">ChevronRight</icon>
        <span class="ml-1 mr-3 overline" :class="colorClass + '--text'">{{ title }}</span>
        <hr class="my-auto mr-2"/>
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
import Icon from "@/components/Icon";

  export default {
    name: "ContractibleList",
    components: {Icon},
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
        return this.hover ? 'bg-grey-900' : 'bg-grey-700';
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
