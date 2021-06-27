<template>
  <base-roster-item :item="item" :selected="selected">

    <v-btn icon small color="green" @click="approve" class="mx-2">
      <v-icon>mdi-check</v-icon>
    </v-btn>
    <v-btn icon small color="red" @click="reject">
      <v-icon>mdi-close</v-icon>
    </v-btn>

    <lazy-sub-accept-privacy-warning-modal v-model="menu" ref="dialog"/>
  </base-roster-item>
</template>

<script>
import BaseRosterItem from "@/components/Roster/RosterItem/BaseRosterItem";

export default {
    name: "PendingRosterItem",
    components: { BaseRosterItem },
    data() {
      return {
        menu: false
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
      async approve() {
        this.menu = true;
        if(await this.$refs.dialog.getResponse()) {
          this.$stanza.roster.accept(this.item.jid);
          this.$emit('approve', this.item);
        }
      },

      reject() {
        this.$stanza.roster.deny(this.item.jid);
        this.$emit('reject', this.item);
      },
    },
  }
</script>
