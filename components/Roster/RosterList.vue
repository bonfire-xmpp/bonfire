<template>
  <div>
    <roster-section v-for="(item, i) in items"
                    :name="item.name" :items="item.items" :key="i"
                    :selected="i === selectedSection ? selectedItem : undefined"
                    :pending="item.name === 'Pending'"/>
  </div>
</template>

<script>
  export default {
    name: "RosterList",
    props: {
      items: Array,
      selectedJid: String,
    },

    data() {
      return {
        selectedSection: -1,
        selectedItem: -1,
      }
    },

    computed: {
      jidLocations() {
        const locations = new Map();

        for (let i = 0; i < this.items?.length || 0; i++) {
          for (let j = 0; j < this.items[i].items?.length || 0; j++) {
            locations.set(this.$stanza.toBare(this.items[i].items[j].jid), [i, j]);
          }
        }

        return locations;
      },
    },

    watch: {
      selectedJid: {
        immediate: true,
        handler(jid) {
          const location = this.jidLocations.get(this.$stanza.toBare(jid));
          if(!location) return;

          this.selectedSection = location[0];
          this.selectedItem = location[1];
        },
      },

      jidLocations: {
        immediate: true,
        handler(jidLocations) {
          const location = jidLocations.get(this.$stanza.toBare(this.selectedJid));
          if(!location) return;

          this.selectedSection = location[0];
          this.selectedItem = location[1];
        },
      },
    },
  }
</script>

<style scoped>

</style>
