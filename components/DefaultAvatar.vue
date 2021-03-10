<template>
  <div
      :style="{ height: size+'px', width: size+'px', backgroundColor: color + ` !important` }"
      class="rounded-circle black"
  >
    <v-icon class="w-100 h-100">mdi-account</v-icon>
  </div>
</template>

<script>
  export default {
    name: "DefaultAvatar",

    props: {
      size: Number,
      color: {
        type: String,
        optional: true,
      }
    },
  }
</script>

<style scoped>

</style>
