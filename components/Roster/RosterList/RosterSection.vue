<template>
  <contractible-list v-if="items && items.length" :title="`${name} (${items.length})`">
    <template v-for="(item, i) in items">
      <roster-item v-if="item" :item="item" :key="i"
                   :class="i && 'mt-1'"
                   :selected="selected.includes(i)"
                   :approve="pending"/>
    </template>
    <template #contracted v-if="selected.length">
      <roster-item :item="items[selected[0]]" selected :approve="pending"/>
    </template>
  </contractible-list>
</template>

<script>
  export default {
    name: "RosterSection",
    props: {
      name: String,
      color: String,
      items: Array,
      pending: Boolean,
      selected: {
        type: Array,
        optional: true,
        default: [],
      }
    },
    methods: {
      approve(item) {
        this.$stanza.client.acceptSubscription(item.jid);
      },

      reject(item) {
        this.$stanza.client.denySubscription(item.jid);
      },
    },
  }
</script>

<style scoped>

</style>
