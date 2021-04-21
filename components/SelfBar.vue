<template>
  <div id="self-bar" class="self-bar d-flex align-center px-3 white--text position-relative">
    <badged-avatar class="clickable" :jid="jid" :size="36" :color="onlineStatus" @click="openStatusMenu"/>
    <v-menu v-if="!$device.isMobileOrTablet" eager v-model="dialog" attach="#self-bar" top max-width="320px" min-width="320px" nudge-top="8px">

      <v-list dense :elevation="0" class="mx-4 rounded" nav>
        <v-list-item ripple v-for="(item, i) in statusMenu" :key="i" @click="item.handler">
          <v-icon :color="item.color" size="0.9em" class="mr-2">{{item.icon}}</v-icon>
          <v-list-item-title :class="item.color + '--text'" style="font-size: 1em;">{{item.title}}</v-list-item-title>
        </v-list-item>

        <v-divider class="mx-4 my-2"/>

        <v-list-item ripple @click="handler || (()=>{})">
          <v-icon color="white" size="1.33em" class="mr-2">mdi-file-edit</v-icon>
          <v-list-item-title class="white--text" style="font-size: 1em;">Edit custom status</v-list-item-title>
        </v-list-item>

      </v-list>

    </v-menu>
    <portal v-else selector="#app">
      <bottom-sheet :items="statusMenu" ref="bottomSheet" class="position-relative" style="z-index: 50;" :divider="false" icon-size="0.9em">
        <v-divider class="mx-4 my-2"/>
        <v-list-item ripple @click="handler || (()=>{})">
          <v-icon color="white" size="1.33em" class="mr-2">mdi-file-edit</v-icon>
          <v-list-item-title class="white--text" style="font-size: 1em;">Edit custom status</v-list-item-title>
        </v-list-item>
      </bottom-sheet>
    </portal>

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
  import { Portal, setSelector } from '@linusborg/vue-simple-portal'
  setSelector('#app')

  export default {
    name: "SelfBar",
    components: {Portal},
    props: {
      jid: String,
    },
    data() {
      return {
        dialog: false
      }
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

      statusMenu() {
        return [
          {icon: 'mdi-circle', title: 'Online', color: 'success', handler: () => this.changeStatus('online')},
          {icon: 'mdi-circle', title: 'Away', color: 'away', handler: () => this.changeStatus('away')},
          {icon: 'mdi-circle', title: 'Extended Away', color: 'xa', handler: () => this.changeStatus('xa')},
          {icon: 'mdi-circle', title: 'Do Not Disturb', color: 'dnd', handler: () => this.changeStatus('dnd')},
          {icon: 'mdi-circle', title: 'Invisible', color: 'offline', handler: () => this.changeStatus('invisible')},
        ]
      },

      openStatusMenu() {
        if(this.$device.isMobileOrTablet) {
          return () => this.$refs.bottomSheet.open();
        } else {
          return () => this.dialog = true;
        }
      }
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
    //line-height: .9em;
  }


  .local-part {
    font-weight: 700;
  }

</style>
