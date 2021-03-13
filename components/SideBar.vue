<template>
  <div class="d-flex flex-column justify-space-between sidebar grey-100 pt-2">
    <roster-list :items="items" ref="rosterlist" :selected-jid="selectedJid"/>
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
        presence: Store.$getters.presence
      }),

      rosterItems() {
        return this.roster?.items;
      },

      selectedJid() {
        return this.activeState && this.activeState.type === "chat" ? this.activeState.entity : undefined;
      },

      onlineItems() {
        return { 
          name: 'Online', 
          items: this.rosterItems?.filter(i => this.presence(i.jid)?.available) 
        };
      },

      offlineItems() {
        return { 
          name: 'Offline', 
          items: this.rosterItems?.filter(i => !this.presence(i.jid)?.available) 
        };
      },

      items() {
        return [
            this.onlineItems,
            this.offlineItems,
        ]
      }
    },

    mounted() {
      console.log(this.roster.items);
    }
  }
</script>

<style scoped lang="scss">
  $systembar-brand-left: 10px !default;

  .sidebar {
    width: 320px;
    min-width: 320px;
    z-index: 10;
    &:hover {
      overflow: hidden auto;
    }
    overflow: hidden hidden;
  }
  .brand {
    font-weight: 400;
    font-size: 16px;

    &:before {
      content: "";
      display: inline-block;
      width: $systembar-brand-left;
    }
  }
</style>
