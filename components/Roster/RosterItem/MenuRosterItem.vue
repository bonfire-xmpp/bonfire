<template>
  <base-roster-item :item="item" :selected="selected"
                    @long-press.native="longpress">

    <template #options>
      <v-btn icon small color="white" @click="click">
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
      <roster-item-menu-tooltip :jid="item.jid" v-model="menu" :position-x="posx" :position-y="posy"/>
    </template>

  </base-roster-item>
</template>

<script>
  import BaseRosterItem from '@/components/Roster/RosterItem/BaseRosterItem';

  export default {
    name: "MoreRosterItem",
    components: { BaseRosterItem },
    data() {
      return {
        menu: false,
        posx: 0, posy: 0,
      }
    },
    props: {
      item: {
        type: Object,
        required: true,
      },
      selected: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
    methods: {
      click(e) {
        this.posx = e?.clientX; this.posy = e?.clientY;
        this.menu = true;
      },
      longpress() {
        this.menu = true;
      },
    },
  }
</script>
