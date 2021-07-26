<template>
  <badge :color="color" :border-color="borderColor" bordered>
    <avatar :size="size" :jid="jid"/>
    <template #badge>
      <slot/>
    </template>
  </badge>

<!--    <v-list dense :elevation="0" class="rounded" nav v-if="resources">-->
<!--      <v-list-item v-for="([jid, item], i) in resources" :key="i">-->
<!--        <circle :class="getColor(item)" style="font-size: 0.9em" class="mr-2">mdi-circle</circle>-->
<!--        <v-list-item-title :class="getColor(item) + '&#45;&#45;text'" style="font-size: 1em;">-->
<!--          <div class="d-flex">-->
<!--            <kbd :class="getColor(item) + '&#45;&#45;text'">{{jid}}</kbd>-->
<!--          </div>-->
<!--        </v-list-item-title>-->
<!--      </v-list-item>-->
<!--    </v-list>-->
</template>

<script lang="ts">
// @ts-ignore
import Store from "@/store";

import { mapState } from 'vuex';
import { defineComponent } from "vue";

// @ts-ignore
import Badge from "@/components/Badge";

// @ts-ignore
import Avatar from "@/components/Avatar";

export default defineComponent({
  name: "BadgedAvatar",
  components: {Badge, Avatar},
  props: {
    size: {
      type: Number,
      default: 36
    },
    clickable: Boolean,
    jid: String,
    color: String,
    borderColor: String,
    disableTooltip: {
      type: Boolean,
      default: false,
    }
  },
  computed: {
    ...mapState({
      allResources: Store.$states.presences,
    }),

    // resources() {
    //   return Object.entries(this.allResources[this.$stanza.toBare(this.jid)] || {})
    //           .filter(([k]) => k !== "" && k !== "_/computed");
    // }
  },
  methods: {
    // getColor(item) { return item.show || (item.available && "online") || "offline"; },
  },
})
</script>
