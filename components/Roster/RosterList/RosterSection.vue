<template>
  <contractible-list v-if="items && items.length" :title="`${name} (${items.length})`">
    <roster-item v-for="(item, i) in items"
                 :item="item" :key="i"
                 :class="i && 'mt-1'"
                 :selected="i === selected"
                 :approve="pending"
                 @approve="approve"
                 @reject="reject"/>
    <template #contracted v-if="selected !== undefined">
      <roster-item :item="items[selected]" selected :approve="pending"/>
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
        type: Number,
        optional: true,
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
