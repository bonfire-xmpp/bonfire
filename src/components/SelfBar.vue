<template>
  <div id="self-bar" class="self-bar flex align-center px-3 text-white position-relative">
    <badged-avatar clickable :jid="jid" :color="onlineStatus" @click.stop="statusMenuTooltip = true"/>
<!--    <status-menu-tooltip attach="#self-bar" v-model="statusMenuTooltip"/>-->

    <main class="flex flex-col hide-overflow ml-2 local-status flex-grow">
      <span class="local-part">{{localPart}}</span>
      <span class="status-message hide-overflow text-grey-700">{{statusMessage || domainPart}}</span>
    </main>

    <aside class="ml-2">
      <v-btn nuxt to="/settings" icon tile medium class="rounded">
        <icon color="grey-900" size="1.5em">mdi-cog</icon>
      </v-btn>
    </aside>
  </div>
</template>

<script>
import {mapState} from "vuex";
import Store from "@/store";
import Icon from "@/components/Icon";
import BadgedAvatar from "@/components/BadgedAvatar";

export default {
    name: "SelfBar",
    components: {BadgedAvatar, Icon},
    props: {
      jid: String,
    },
    data() {
      return {
        statusMenuTooltip: false,
      }
    },
    computed: {
      ...mapState({
        // TODO: Handle invisibility
        onlineStatus: Store.$states.onlineStatus,
        statusMessage: Store.$states.statusMessage,
      }),

      localPart() {
        return this.$stanza.getLocal(this.jid);
      },

      domainPart() { return this.$stanza.getDomain(this.jid); },
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
