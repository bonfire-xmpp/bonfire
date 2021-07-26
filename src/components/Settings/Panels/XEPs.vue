<template>
  <div class="text-white unselectable" :class="{'pt-3': mobile}">
    <panel-title v-if="!mobile">Supported XEPs</panel-title>

    <p>This is a list of XEPs supported by the server. Green cells indicated supported XEPs.</p>

    <v-divider/>

    <div class="my-3 flex">
      <h3 class="mx-2">{{supportedNo}}/{{xeps.length}} supported &mdash; {{supportedPct}}%</h3>

      <v-spacer/>

      <v-btn plain outlined color="success" @click="refresh">
        <icon left>mdi-refresh</icon><span class="text-white">refresh</span>
      </v-btn>
    </div>

    <masonry
        :cols="{default: 3, 1330: 2, 928: 1}"
        :gutter="{default: '8px'}"
    >
      <template v-for="(xep, i) in xeps" :key="i">
      <XEPCell class="my-2"
               v-bind="xep"
               :animated="animated"
               :disabled="refreshing"
               :delay="i * 25"
               :supported="!refreshing && xep.supported"/>
      </template>
    </masonry>

  </div>
</template>

<script>
import PanelTitle from "@/components/Settings/Panels/UI/PanelTitle";
import XEPCell from "./UI/XEPCell";

import XEPs from '@/assets/xeps/server/data';

import XEPStore from "@/store/xeps";
import {mapActions, mapState} from 'vuex';

export default {
  name: "XEPs",
  components: {PanelTitle, XEPCell},
  props: ['mobile'],
  data() {
    return {
      refreshing: false,
      animated: false,
    }
  },
  computed: {
    ...mapState(XEPStore.namespace, {
      supportedXeps: XEPStore.$states.server,
    }),

    xeps() {
      return Array.from(XEPs.entries())
          .map(([no, obj]) => ({
            no, ...obj,
            supported: this.supportedXeps[no]
          }));
    },

    supportedNo() { return this.xeps.reduce((acc, x) => x.supported ? acc+1 : acc, 0) },
    supportedPct() { return Math.round(100 * this.supportedNo / this.xeps.length) },
  },

  methods: {
    ...mapActions(XEPStore.namespace, {
      refreshXeps: XEPStore.$actions.updateXepsWithDisco,
    }),

    async refresh() {
      this.refreshing = true;
      this.animated = true;

      await this.refreshXeps();

      this.refreshing = false;

      // Wait for the animation to end -- roughly -- before removing it
      setTimeout(() => this.animated = false, 1000)
    }
  },
}
</script>

<style scoped>

</style>
