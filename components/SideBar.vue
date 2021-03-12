<template>
  <div class="sidebar grey-100 py-2">
    <roster-list :items="items" :selected-jid="selectedJid"/>
  </div>
</template>

<script>
  import { Store } from "@/store";
  import { mapState, mapGetters } from 'vuex';

  export default {
    computed: {
      ...mapState({
        roster: Store.$states.roster,
        activeState: Store.$states.activeChat,
      }),

      ...mapGetters({
        presence: Store.$getters.presence,
      }),

      rosterItems() {
        return this.roster?.items || [];
      },

      selectedJid() {
        return this.activeState?.type === "chat" ? this.activeState.entity : undefined;
      },

      onlineItems() {
        return { name: 'Online', items: this.rosterItems.filter(i => this.presence(i.jid)?.available) };
      },

      offlineItems() {
        return { name: 'Offline', items: this.rosterItems.filter(i => !this.presence(i.jid)?.available && !i.pending) };
      },

      pendingItems() {
        return { name: 'Pending', items: this.rosterItems.filter(i => i.pending) };
      },

      items() {
        return [
            this.onlineItems,
            this.pendingItems,
            this.offlineItems,
        ]
      }
    },

    mounted() {
      console.log(this.roster.items)
    }
  }
</script>

<style scoped lang="scss">
  .sidebar {
    width: 320px;
    min-width: 320px;
    &:hover {
      overflow: hidden auto;
    }
    overflow: hidden hidden;
  }
</style>
