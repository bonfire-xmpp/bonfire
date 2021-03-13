<template>
  <contractible-list v-if="items && items.length" :title="`${name} (${items.length})`">
    <roster-item v-for="(item, i) in items"
                 :item="item" :key="i"
                 :class="i && 'mt-1'"
                 :selected="i === selected"/>
    <template #contracted v-if="selected !== undefined">
      <roster-item :item="items[selected]" selected/>
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
      selected: {
        type: Number,
        optional: true,
      }
    },
  }
</script>

<style scoped>

</style>
