<template>
  <div class="d-flex pa-1 flex-wrap justify-content-between" v-if="items.length">

    <nuxt-link :to="'/chat/' + item.jid" tag="div"
               class="clickable margin"
               v-for="(item, i) in items.slice(0,12)"
               :key="i">
      <div class="rounded-circle" :class="i === selectedAvatar ? 'selected' : 'unselected'">
        <avatar :jid="item.jid" :size="36"/>
      </div>
    </nuxt-link>

    <!-- Filler empty elements to properly align flexbox -->
    <div v-for="i in (7 - (items.length % 7))" :key="'filler' + i" class="h-0 filler margin"/>
  </div>
</template>

<script>
  export default {
    name: "PinnedItems",
    props: {
      items: Array,
      selected: {
        type: String,
        optional: true,
      }
    },
    computed: {
      selectedAvatar() {
        return this.items.findIndex(i => this.$stanza.toBare(i.jid) === this.selected);
      },
    },
  }
</script>

<style scoped lang="scss">
  .filler {
    width: 40px;
  }

  .margin { margin: 2px; }

  .selected {
    border: map-get($greys, "700");
    border-width: 2px;
    border-style: solid;
  }

  .unselected {
    border: transparent;
    border-width: 2px;
    border-style: solid;
  }
</style>
