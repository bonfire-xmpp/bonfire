<template>
  <div :style="styleObject">
    <ion-img v-bind="$attrs" v-if="!eager" :alt="alt" :src="src"/>
    <img     v-bind="$attrs" v-else :alt="alt" :src="src" class="w-full h-full">
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {IonImg} from "@ionic/vue";

export default defineComponent({
  name: "Image",
  components: { IonImg },
  props: {
    eager: {
      type: Boolean,
      required: false,
      default: false,
    },
    width: [String, Number],
    height: [String, Number],
    size: [String, Number],
    alt: String,
    src: {
      type: String,
      required: true,
    },
  },
  computed: {
    styleObject(): object {
      const toPx = (t: any) => {
        if(typeof t === "number") return t + 'px';
        return t;
      }

      return {
        width: toPx(this.size || this.width),
        height: toPx(this.size || this.height),
      };
    }
  }
});
</script>

<style scoped>

</style>
