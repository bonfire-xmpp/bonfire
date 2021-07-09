<template>
  <div class="sidebar grey-100 d-flex flex-column">
    <header-bar/>
    <div class="d-flex flex-grow-1 flex-column">
      <accordion-item header="Roster"
                      :expanded="!expanded"
                      @expanded="expanded = !expanded">
        <simplebar class="narrow-scrollbar">
          <div class="d-flex flex-column mt-2">
            <v-btn outlined color="green" class="mx-2" @click="menu = true">Add Friend</v-btn>
          </div>
          <roster-list
              :pinned="[]"
              :items="items"
              :selected-jid="selectedJid"/>
        </simplebar>
      </accordion-item>

      <v-divider v-if="expanded"/>

      <accordion-item header="Recent" :expanded="!!expanded"
                      @expanded="expanded = !expanded" style="z-index: 2"/>
    </div>
    <self-bar style="z-index: 3" :jid="$stanza.client.jid"/>

    <lazy-add-friend-modal v-model="menu"/>
  </div>
</template>

<script>
  import { Store } from "@/store";
  import { mapState, mapGetters } from 'vuex';
  import AccordionItem from "@/components/Accordion/Item";

  export default {
    components: {AccordionItem},
    data() {
      return {
        expanded: 0,
        menu: false,
      }
    },
    methods: {
      toggle() {
        this.expanded = (this.expanded + 1) % 2
      },
      getPresence(jid) {
        return this.presences?.[this.$stanza.toBare(jid)]?.['_/computed'];
      }
    },
    computed: {
      ...mapState({
        roster: Store.$states.roster,
        presences: Store.$states.presences,
        pending: Store.$states.pending,
        activeState: Store.$states.activeChat,
      }),

      ...mapGetters({
        presence: Store.$getters.presence
      }),

      rosterItems() {
        return this.roster?.items || [];
      },

      selectedJid() {
        return this.activeState?.type === "chat" ? this.activeState.entity : undefined;
      },

      onlineItems() {
        return { name: 'Online', items: this.rosterItems.filter(i => i.subscription === "both" && this.getPresence(i.jid)?.available) };
      },

      offlineItems() {
        return { name: 'Offline', items: this.rosterItems.filter(i => !this.getPresence(i.jid)?.available && !i.pending) };
      },

      pendingItems() {
        return { name: 'Pending', items: this.pending.map(p => ({jid: p})) };
      },

      sentRequests() {
        return { name: 'Sent Requests', items: this.rosterItems.filter(i => i.pending === "subscribe") };
      },

      observers() {
        return { name: 'Observers', items: this.rosterItems.filter(i => i.subscription === "from") };
      },

      acquaintances() {
        return { name: 'Acquaintances', items: this.rosterItems.filter(i => i.subscription === "to" && this.getPresence(i.jid)?.available) };
      },

      items() {
        return [
            this.pendingItems,
            this.onlineItems,
            this.acquaintances,
            this.observers,
            this.offlineItems,
            this.sentRequests,
        ];
      }
    },
  }
</script>

<style scoped lang="scss">
  $systembar-brand-left: 10px !default;

  .sidebar {
    width: 320px;
    min-width: 320px;
    z-index: 10;
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
