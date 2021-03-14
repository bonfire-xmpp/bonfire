<template>
  <pending-roster-item v-if="approve" :selected="selected" :item="item"/>
  <menu-roster-item v-else-if="menu" :selected="selected" :item="item"/>
</template>

<script>
  import MenuRosterItem from "@/components/Roster/RosterItem/MenuRosterItem";
  import PendingRosterItem from "@/components/Roster/RosterItem/PendingRosterItem";
  import { Store } from "@/store";
  import { mapGetters } from "vuex";

  export default {
    name: "RosterItem",
    components: { MenuRosterItem, PendingRosterItem },
    props: {
      item: {
        type: Object,
        required: true,
      },
      selected: {
        type: Boolean,
        required: false,
        default: false,
      },
      approve: {
        type: Boolean,
        required: false,
        default: false,
      },
      menu: {
        type: Boolean,
        required: false,
        default: true,
      },
    },
    computed: {
      ...mapGetters({
        getPresence: Store.$getters.presence,
      }),

      name() { return JID.getLocal(this.item.jid); },
      domain() { return JID.getDomain(this.item.jid); },
      presence() { return this.getPresence(this.item.jid); },

      available() { return this.presence?.available; },
      statusMessage() { return this.presence?.status; },

      onlineStatus() { return this.presence?.show; },
      statusColor() {
        switch (this.onlineStatus) {
          case 'xa':
          case 'away':
              return 'warning';
          case 'dnd':
            return 'error';
        }

        if(!this.available) return 'grey';
        if(!this.onlineStatus && this.available) return 'success';
      }
    },
  }
</script>

<style scoped lang="scss">
  // Constant height
  $height: 50px;
  .main {
    height: $height;
    min-height: $height;
    max-height: $height;
  }

  // Hide options when the .main container _isn't_ hovered
  .main:not(:hover) > .options-container {
    display: none;
  }

  // Hover and selected background colors
  // NOTE: order of :hover and [aria-selected] matters, as they have the same specificity
  .main {
    &:hover {
      background: map-get($greys, "200");
    }

    &[aria-selected] {
      background: map-get($greys, "300");
      
    }
  }
</style>