<template>
  <div class="d-flex">
    <!-- Roster item card  -->
    <div class="flex-grow-1 hide-overflow d-flex rounded main" :aria-selected="selected" >
      <!-- Vertical align Avatar -->
      <div class="align-content-center-inline ml-2 mr-1" style="width: 36px">
        <v-badge bottom dot offset-x="11" offset-y="11" bordered :color="onlineStatus">
          <avatar :size="36" :jid="item.jid"/>
        </v-badge>
      </div>
      <div class="main-container ml-2 pr-2 flex-grow-1 my-auto hide-overflow">
        <!-- Online status icon, username@domain -->
        <span :class="selected ? '' : 'grey-700--text'">
          {{name}}<span :class="selected ? '' : 'grey-400--text'">@{{domain}}</span>
        </span>
      </div>
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
  height: 42px;
  min-height: 42px;
  max-height: 42px;
}
</style>
