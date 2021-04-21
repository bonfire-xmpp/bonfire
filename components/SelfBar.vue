<template>
  <div class="self-bar d-flex align-center px-3 white--text">
    <badged-avatar :jid="jid" :size="36" :color="onlineStatus"/>

    <main class="d-flex flex-column hide-overflow ml-2 local-status flex-grow-1">
      <span class="local-part">{{localPart}}</span>
      <span v-if="statusMessage" class="status-message hide-overflow grey-700--text">{{statusMessage}}</span>
    </main>

    <aside class="ml-2">
      <v-btn nuxt to="/settings" icon tile medium class="rounded">
        <v-icon color="grey-900" size="1.5em">mdi-cog</v-icon>
      </v-btn>
    </aside>
  </div>
</template>

<script>
  import {mapGetters} from "vuex";
  import {Store} from "@/store";

  export default {
    name: "SelfBar",
    props: {
      jid: String,
    },
    computed: {
      ...mapGetters({
        getPresence: Store.$getters.presence,
      }),

      localPart() {
        return this.$stanza.getLocal(this.jid);
      },

      presence() { return this.getPresence(this.jid); },

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
   $self-bar-background: map-get($black, "base");

  .self-bar {
    @include ensure-height(3.5rem);
    @include v-badge-border-color($self-bar-background);
    font-size: .9rem;
    line-height: .9rem;
    background: $self-bar-background;
  }

  .local-status {
    //line-height: .9em;
  }


  .local-part {
    font-weight: 700;
  }

</style>
