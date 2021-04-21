<template>
  <vue-bottom-sheet max-width="100vw" max-height="85vh" overlay click-to-close ref="mobileDialog">
    <v-list tile subheader color="transparent" class="mb-6">

      <template v-for="(item, i) in items">
        <v-list-item ripple :key="i" @click="item.handler || (()=>{})"
                     :nuxt="!!item.to" :to="item.to"
                     :href="item.href">
          <v-icon v-if="item.icon" :color="item.color || 'white'" size="1.66em" class="mr-2">{{item.icon}}</v-icon>
          <v-list-item-title :class="(item.color || 'white') + '--text'">{{item.title}}</v-list-item-title>
        </v-list-item>
        <v-divider class="mx-4"/>
      </template>

    </v-list>
  </vue-bottom-sheet>
</template>

<script>
export default {
  name: "BottomSheet",
  props: {
    items: Array,
    // [{icon?, color?, title, handler? | to? | href?}]
  },
  methods: {
    open()  { this.$refs.mobileDialog.open();  },
    close() { this.$refs.mobileDialog.close(); },
  },
}
</script>

<style scoped lang="scss">
*::v-deep .bottom-sheet__card {
  background: map-get($greys, "200") !important;
}

*::v-deep .bottom-sheet__bar {
  background: transparentize(map-get($white, "base"), 0.7) !important;
}
</style>
