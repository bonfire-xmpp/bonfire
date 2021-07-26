<template>
  <teleport to="#bonfire" v-if="$device.isMobileOrTablet">
    <bottom-sheet :items="statusMenu" ref="bottomSheet" class="position-relative" style="z-index: 50;" :divider="false"
                  icon-size="0.9em"/>
  </teleport>
  <div v-else-if="value">
    <v-menu :value="value" @input="$emit('input', $event)"
            :attach="attach" max-width="320px" :transition="false"
            absolute :position-x="positionX" :position-y="positionY" z-index="50">

      <v-list dense :elevation="0" class="rounded" nav>
        <template v-for="(item, i) in statusMenu">
          <template v-if="!item.mobile">
            <v-divider v-if="item.divider" class="mx-4 my-2"/>
            <v-list-item v-else ripple :key="i" @click="item.handler"
                         style="min-height: 32px !important;">
              <icon v-if="item.icon" :class="item.color" size="0.9em" class="mr-2">{{item.icon}}</icon>
              <v-list-item-title :class="item.color + '--text'" style="font-size: 14px;" v-html="item.title"/>
            </v-list-item>
          </template>
        </template>

      </v-list>

    </v-menu>
  </div>
</template>

<script>

export default {
  name: 'roster-item-menu-tooltip',
  components: {},
  props: {
    value: Boolean,
    attach: [String, Object],
    jid: String,
    positionX: Number, positionY: Number,
  },
  computed: {
    statusMenu() {
      return [
        {title: `<b>${this.$stanza.toBare(this.jid)}</b>`, color: 'white', handler: ()=>{}, mobile: true},
        {divider: true, mobile: true},
        {title: 'Remove Friend', color: 'red', handler: () => this.$stanza.roster.deny(this.jid)},
      ]
    },
  },
  watch: {
    value(val) {
      if(this.$device.isMobileOrTablet && val) {
        this.$nextTick(() => {
          this.$refs.bottomSheet.open();
          this.$emit('input', false);
        });
      }
    }
  },
}
</script>
