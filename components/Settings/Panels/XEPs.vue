<template>
  <div class="white--text" :class="{'pt-3': mobile}">
    <panel-title v-if="!mobile">Supported XEPs</panel-title>

    <p>This is a list of XEPs supported by the server. Green cells indicated supported XEPs.</p>

    <masonry
        :cols="{default: 3, 1330: 2, 928: 1}"
        :gutter="{default: '8px'}"
    >
      <XEPCell class="my-2" v-for="(xep, i) in xeps" v-bind="xep" :key="i" />
    </masonry>

  </div>
</template>

<script>
import PanelTitle from "@/components/Settings/Panels/UI/PanelTitle";
import XEPCell from "./UI/XEPCell";

import XEPs from 'assets/xeps/server/data';

import { XEPStore } from "@/store/xeps";
import { mapState } from 'vuex';

export default {
  name: "XEPs",
  components: {PanelTitle, XEPCell},
  props: ['mobile'],
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
    }
  },
}
</script>

<style scoped>

</style>
