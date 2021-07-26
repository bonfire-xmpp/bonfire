<template>
  <div>
    <v-menu v-if="!$device.isMobileOrTablet" :value="value" @input="$emit('input', $event)"
            eager :attach="attach" top max-width="320px" min-width="320px" nudge-top="8px">

      <v-list dense :elevation="0" class="mx-4 rounded" nav>
        <template v-for="(item, i) in statusMenu">
          <v-divider :key="i+'divider'" v-if="item.divider" class="mx-4 my-2"/>
          <v-list-item v-else ripple :key="i" @click="item.handler">
            <icon :color="item.color" size="0.9em" class="mr-2">{{item.icon}}</icon>
            <v-list-item-title :class="item.color + '--text'" style="font-size: 1em;">
              <div>{{item.title}}</div>
            </v-list-item-title>
          </v-list-item>
        </template>

        <v-divider class="mx-4 my-2"/>

        <v-list-item ripple @click.stop="customStatusModal = true">
          <icon color="white" size="1.33em" class="mr-2">mdi-file-edit</icon>
          <v-list-item-title class="text-white" style="font-size: 1em;">{{ currentStatus || "Edit custom status" }}</v-list-item-title>
          <v-list-item-action v-if="currentStatus">
            <v-btn icon height="1em" width="1.33em" :ripple="false" plain @click.stop="clearStatusMessage">
              <icon size="1.33em" color="white">mdi-close-circle</icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>

        <v-list-item @click.stop="" :ripple="false">
          <icon color="white" size="1.33em" class="mr-2">mdi-reorder-horizontal</icon>
          <v-list-item-title class="text-white" style="font-size: 1em;">Resource Priority: </v-list-item-title>
          <number-input :max="127" :min="-127" v-model="resourcePriority"/>
        </v-list-item>

      </v-list>

    </v-menu>

    <teleport v-else to="#app">
      <bottom-sheet :items="statusMenu" ref="bottomSheet" class="position-relative" style="z-index: 50;" :divider="false"
                    icon-size="0.9em">
        <v-divider class="mx-4 my-2"/>
        <v-list-item ripple @click.stop="customStatusModal = true">
          <icon color="white" size="1.33em" class="mr-2">mdi-file-edit</icon>
          <v-list-item-title class="text-white" style="font-size: 1em;">{{ currentStatus || "Edit custom status" }}</v-list-item-title>
          <v-list-item-action v-if="currentStatus">
            <v-btn icon height="1em" width="1.33em" :ripple="false" plain @click.stop="clearStatusMessage">
              <icon size="1.33em" color="white">mdi-close-circle</icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
        <v-list-item @click.stop="" :ripple="false">
          <icon color="white" size="1.33em" class="mr-2">mdi-reorder-horizontal</icon>
          <v-list-item-title class="text-white" style="font-size: 1em;">Resource Priority: </v-list-item-title>
          <number-input class="number-input" :max="127" :min="-127"/>
        </v-list-item>
      </bottom-sheet>
    </teleport>

<!--    <custom-status-modal v-model="customStatusModal"/>-->
  </div>
</template>

<script>
import {mapMutations, mapState} from "vuex";
import Store from "@/store";
import SettingsStore from "@/store/settings";

export default {
  name: 'status-menu-tooltip',
  components: {},
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

    ...mapState(SettingsStore.namespace, {
      resourcePriorityV: SettingsStore.$states.resourcePriority,
    }),
    resourcePriority: {
      get() { return this.resourcePriorityV; },
      set(v) { this.setResourcePriority(v); },
    },

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
    ...mapMutations(SettingsStore.namespace, {
      setResourcePriority: 'SET_' + SettingsStore.$states.resourcePriority
    }),

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
.number-input::v-deep * {
  border-color: map-get($greys, "700") !important;
}
</style>
