<template>
  <v-tooltip right v-if="!disableTooltip" :open-delay="500"
             transition="fade-transition"
             content-class="avatar-resource-tooltip">

    <template v-slot:activator="{ on, attrs }">
      <!--div here because <badge> is a functional component
          and it inherits classes weirdly, etc.-->
      <div>
        <badge :color="color" :border-color="borderColor" bordered @click="$emit('click', $event)">
          <avatar :size="size" :jid="jid" @click="$emit('click', $event)"
                  :class="{clickable}"
                  @mouseover.native="disableTooltip || on.mouseenter($event)"
                  @mouseout.native="disableTooltip || on.mouseleave($event)"
                  @click.native="on.blur()" @long-press.native="on.mouseenter()"
                  v-click-outside="on.blur"/>
          <template #badge>
            <slot @click="$emit('click', $event)"/>
          </template>
        </badge>
      </div>
    </template>

    <v-list dense :elevation="0" class="rounded" nav>
      <v-list-item v-for="([jid, item], i) in resources" :key="i">
        <v-icon :color="getColor(item)" size="0.9em" class="mr-2">mdi-circle</v-icon>
        <v-list-item-title :class="getColor(item) + '--text'" style="font-size: 1em;">
          <div class="d-flex">
            <kbd :class="getColor(item) + '--text'">{{jid}}</kbd>
          </div>
        </v-list-item-title>
      </v-list-item>
    </v-list>

  </v-tooltip>

  <badge v-else :color="color" :border-color="borderColor" bordered @click="$emit('click', $event)">
    <avatar :size="size" :jid="jid" @click="$emit('click', $event)"/>
    <template #badge>
      <slot @click="$emit('click', $event)"/>
    </template>
  </badge>
</template>

<script>
  import { Store } from "@/store";
  import { mapState } from 'vuex';

  export default {
    name: "BadgedAvatar",
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

      resources() {
        return Object.entries(this.allResources[this.$stanza.toBare(this.jid)])
                .filter(([k]) => k !== "" && k !== "_/computed");
      }
    },
    methods: {
      getColor(item) { return item.show || (item.available && "online") || "offline"; },
    },
  }
</script>

<style lang="scss" scoped>
  .badge::v-deep .v-badge__badge {
    padding: 0 !important;
    height: auto !important;
    transition: none !important;
  }
</style>

<style>
.avatar-resource-tooltip {
  padding: 0 !important;
}
</style>
