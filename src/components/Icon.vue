<template>
  <component :is="resolved" :height="size" :width="size" :class="colorClass"/>
</template>

<script lang="ts">
import {computed, defineComponent, onBeforeMount, onUpdated, shallowRef, toRefs} from 'vue';

export default defineComponent({
  name: "Icon",
  props: {
    size: {
      type: String,
      default: '1em',
    },
    color: {
      type: String,
      default: 'white',
    },
  },
  setup(props, {slots}) {
    const resolved = shallowRef(null);

    const pascalize = (s: string): string => {
      const camelized = s.replace(/-./g, x => x[1].toUpperCase())
      return camelized.charAt(0).toUpperCase() + camelized.slice(1);
    }

    const importIcon = async () => {
      if(typeof slots.default === "undefined" || typeof slots.default()[0].children !== "string") {
        throw new TypeError("Expected text-node in default slot for <icon/>")
      }

      let icon: string = slots.default()[0].children as string;
      icon = icon.startsWith('mdi-') ? pascalize(icon.slice(4)) : icon;
      resolved.value = await import('mdue').then(is => (is as any)[icon]);
    }

    onBeforeMount(importIcon);
    // onUpdated(importIcon);

    const { color } = toRefs(props);
    const colorClass = computed(() => `text-${color.value}`);

    return {
      resolved,
      colorClass,
    }
  },
});
</script>
