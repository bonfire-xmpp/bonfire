<template>
  <div>
    <v-menu v-if="!$device.isMobileOrTablet" :value="value" @input="$emit('input', $event)"
            eager :attach="attach" top max-width="320px" min-width="320px" nudge-top="8px">

      <v-list dense :elevation="0" class="mx-4 rounded" nav>
        <template v-for="(item, i) in statusMenu">
          <v-divider v-if="item.divider" class="mx-4 my-2"/>
          <v-list-item v-else ripple :key="i" @click="item.handler">
            <v-icon :color="item.color" size="0.9em" class="mr-2">{{item.icon}}</v-icon>
            <v-list-item-title :class="item.color + '--text'" style="font-size: 1em;">
              <div>{{item.title}}</div>
            </v-list-item-title>
          </v-list-item>
        </template>

        <v-divider class="mx-4 my-2"/>

        <v-list-item ripple @click.stop="customStatusModal = true">
          <v-icon color="white" size="1.33em" class="mr-2">mdi-file-edit</v-icon>
          <v-list-item-title class="white--text" style="font-size: 1em;">{{ currentStatus || "Edit custom status" }}</v-list-item-title>
          <v-list-item-action v-if="currentStatus">
            <v-btn icon height="1em" width="1.33em" :ripple="false" plain @click.stop="clearStatusMessage">
              <v-icon size="1.33em" color="white">mdi-close-circle</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>

      </v-list>

    </v-menu>

    <portal v-else selector="#app">
      <bottom-sheet :items="statusMenu" ref="bottomSheet" class="position-relative" style="z-index: 50;" :divider="false"
                    icon-size="0.9em">
        <v-divider class="mx-4 my-2"/>
        <v-list-item ripple @click.stop="customStatusModal = true">
          <v-icon color="white" size="1.33em" class="mr-2">mdi-file-edit</v-icon>
          <v-list-item-title class="white--text" style="font-size: 1em;">{{ currentStatus || "Edit custom status" }}</v-list-item-title>
          <v-list-item-action v-if="currentStatus">
            <v-btn icon height="1em" width="1.33em" :ripple="false" plain @click.stop="clearStatusMessage">
              <v-icon size="1.33em" color="white">mdi-close-circle</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </bottom-sheet>
    </portal>

    <custom-status-modal v-model="customStatusModal"/>
  </div>
</template>

<script>
import CustomStatusModal from "@/components/CustomStatusModal"
import {setSelector, Portal} from '@linusborg/vue-simple-portal'
import {mapState} from "vuex";
import {Store} from "@/store";
setSelector('#app');

export default {
  name: 'status-menu-tooltip',
  components: {Portal, CustomStatusModal},
  props: {
    value: Boolean,
    attach: String
  },
  data() {
    return {
      customStatusModal: false
    }
  },
  computed: {
    ...mapState({
      currentStatus: Store.$states.statusMessage,
    }),

    statusMenu() {
      return [
        {icon: 'mdi-circle', title: 'Online', color: 'online', handler: () => this.changeStatus('online')},
        {divider: true},
        {icon: 'mdi-circle', title: 'Away', color: 'away', handler: () => this.changeStatus('away')},
        {icon: 'mdi-circle', title: 'Extended Away', color: 'xa', handler: () => this.changeStatus('xa')},
        {icon: 'mdi-circle', title: 'Do Not Disturb', color: 'dnd', handler: () => this.changeStatus('dnd')},
        {icon: 'mdi-circle', title: 'Invisible', color: 'offline', handler: () => this.changeStatus('invisible')},
      ]
    },
  },
  methods: {
    changeStatus(to) {
      if(to === 'invisible') return this.$stanza.goInvisible();
      this.$stanza.setOnlineStatus(to);
    },
    clearStatusMessage() {
      this.$stanza.setStatusMessage("");
    },
  },
  watch: {
    value(val) {
      if(this.$device.isMobileOrTablet && val) {
        this.$refs.bottomSheet.open();
        this.$emit('input', false);
      }
    }
  },
}
</script>

<style scoped lang="scss">
</style>
