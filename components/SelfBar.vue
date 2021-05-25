<template>
  <div id="self-bar" class="self-bar d-flex align-center px-3 white--text position-relative">
    <badged-avatar class="clickable" :jid="jid" :color="onlineStatus" @click.stop="statusMenuTooltip = true"/>
    <status-menu-tooltip attach="#self-bar" v-model="statusMenuTooltip"/>

    <main class="d-flex flex-column hide-overflow ml-2 local-status flex-grow-1">
      <span class="local-part">{{localPart}}</span>
      <span class="status-message hide-overflow grey-700--text">{{statusMessage || domainPart}}</span>
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
import {setSelector} from '@linusborg/vue-simple-portal'
import StatusMenuTooltip from "@/components/StatusMenuTooltip";

setSelector('#app')

  export default {
    name: "SelfBar",
    components: {StatusMenuTooltip},
    props: {
      jid: String,
    },
    data() {
      return {
        statusMenuTooltip: false,
      }
    },
    computed: {
      ...mapGetters({
        getPresence: Store.$getters.presence,
      }),

      localPart() {
        return this.$stanza.getLocal(this.jid);
      },

      domainPart() { return this.$stanza.getDomain(this.jid); },

      presence() { return this.getPresence(this.jid); },

      available() { return this.presence?.available; },
      statusMessage() { return this.presence?.status; },

      onlineStatus() {
        if(!this.available) return 'offline';
        if(!this.presence?.show && this.available) return 'online';
        return this.presence?.show;
      },
    },
    methods: {
      changeStatus(to) {

      }
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
    height: 36px;
    justify-content: space-evenly;
    //line-height: .9em;
  }


  .local-part {
    font-weight: 700;
  }

</style>
