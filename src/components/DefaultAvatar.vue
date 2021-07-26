<template>
  <div
      :style="{ height: size+'px', width: size+'px', backgroundColor: color + ` !important` }"
      class="rounded-circle bg-black"
  >
    <icon class="w-full h-full">mdi-account</icon>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import Icon from "@/components/Icon";

export default defineComponent({
  name: "DefaultAvatar",
  components: {Icon},
  props: {
    size: Number,
    color: {
      type: String,
      optional: true,
    }
  },
})
</script>

<style scoped>

</style>
