<template>
  <v-app dark>
    <system-bar dark/>
    <v-main>
      <nuxt/>
    </v-main>
  </v-app>
</template>

<script>
  import SystemBar from "@/components/SystemBar";

  export default {
    layout: 'default',
    components: {SystemBar}
  }
</script>
