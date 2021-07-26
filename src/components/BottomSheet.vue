<template>
  <vue-bottom-sheet max-width="100vw" max-height="85vh" overlay click-to-close ref="mobileDialog">
    <v-list tile subheader color="transparent" class="mb-6">

      <template v-for="(item, i) in items">
        <v-list-item ripple :key="i" @click="click(item)($event)"
                     :nuxt="!!item.to" :to="item.to"
                     :href="item.href" v-if="!item.divider">
          <icon v-if="item.icon" :color="item.color || 'white'" :size="iconSize" class="mr-2">{{item.icon}}</icon>
          <v-list-item-title :class="(item.color || 'bg-white') + '--text'" v-html="item.title"/>
        </v-list-item>
        <v-divider v-else class="mx-4 my-2"/>
      </template>

      <slot/>

    </v-list>
  </vue-bottom-sheet>
</template>

<script>
export default {
  name: "BottomSheet",
  props: {
    // [{icon?, color?, title, handler? | to? | href?}]
    items: Array,
    divider: {
      type: Boolean,
      default: true,
    },
    iconSize: {
      type: [Number, String],
      default: "1.5em",
    }
  },
  methods: {
    open()  { this.$refs.mobileDialog.open();  },
    close() { this.$refs.mobileDialog.close(); },
    click(item) {
      const handler = item.handler || (()=>{});
      return e => {
        handler(e);
        this.close()
      };
    }
  },
}
</script>

<style scoped lang="scss">
*::v-deep .bottom-sheet__card {
  background: map-get($greys, "200") !important;
}

*::v-deep .bottom-sheet__bar {
  background: map-get($white, "base") !important;
}
</style>
