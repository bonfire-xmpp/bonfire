<template>
  <!-- Roster item card  -->
  <div class="d-flex main white--text unselectable" :aria-selected="selected" >
    <!-- Vertical align Avatar -->
    <div class="align-content-center-inline mr-1" style="width: 36px">
      <v-badge bottom dot offset-x="11" offset-y="11" bordered :color="onlineStatus">
        <avatar :size="36" :jid="item.jid"/>
      </v-badge>
    </div>

    <div class="ml-2 pr-2 my-auto" :class="selected || 'grey-700--text'">
      <!-- username -->
      <span :class="selected && 'font-weight-bold'">{{name}}</span>

      <!-- @ -->
      <span style="margin-left: -2px; margin-right: -2px;">
          <v-icon class="no-transition" color="grey-400" size="1em">mdi-at</v-icon>
      </span>

      <!-- domain -->
      <span class="grey-500--text">
        {{domain}}
      </span>
    </div>
  </div>
</template>

<script>
  import { Store } from "@/store";
  import { mapGetters } from 'vuex';
  import Avatar from "@/components/Avatar";

  export default {
    name: "RosterItem",
    components: { Avatar },
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
    },

    computed: {
      ...mapGetters({
        getPresence: Store.$getters.presence,
      }),

      name() { return this.$stanza.getLocal(this.item.jid); },
      domain() { return this.$stanza.getDomain(this.item.jid); },
      presence() { return this.getPresence(this.item.jid); },

      available() { return this.presence?.available; },
      statusMessage() { return this.presence?.status; },

      onlineStatus() {
        if(!this.available) return 'offline';
        if(!this.presence?.show && this.available) return 'online';
        return this.presence?.show;
      },
    },
  }
</script>

<style scoped lang="scss">
  // Constant height
  .main {
    @include ensure-height(42px);
  }
</style>
