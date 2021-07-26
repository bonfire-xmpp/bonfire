<template>
  <div>
    <pinned-items :items="pinned" :selected="selectedJid"/>
    <template v-for="(item, i) in items">
      <roster-section v-if="item"
                      :name="item.name" :items="item.items" :key="i"
                      :selected="selectedSectionsItems[i]"
                      :pending="item.name === 'Pending'"/>
    </template>
  </div>
</template>

<script>
  import PinnedItems from "@/components/Roster/PinnedItems";
  import RosterSection from "@/components/Roster/RosterList/RosterSection";

  export default {
    name: "RosterList",
    components: {PinnedItems, RosterSection},
    props: {
      pinned: {
        type: Array,
        optional: true,
        default: () => [],
      },
      items: Array,
      selectedJid: String,
    },

    computed: {
      selectedSectionsItems() {
        const locations = [];

        this.items?.forEach(({items}) =>
          locations.push(
              items
                  ?.map((x, i) => [x, i]) // zip items [0..]
                  .filter(([x]) => x?.jid === this.selectedJid)
                  .map(([, i]) => i)) // map snd
        );


        return locations;
      },
    },
  }
</script>

<style scoped>

</style>
