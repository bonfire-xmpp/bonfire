<template>
  <base-roster-item :item="item" :selected="selected">

    <v-btn icon small color="green" @click="approve" class="mx-2">
      <icon>mdi-check</icon>
    </v-btn>
    <v-btn icon small color="red" @click="reject">
      <icon>mdi-close</icon>
    </v-btn>

<!--    <sub-accept-privacy-warning-modal v-model="menu" ref="dialog"/>-->
  </base-roster-item>
</template>

<script>
import BaseRosterItem from "@/components/Roster/RosterItem/BaseRosterItem";
import Icon from "@/components/Icon";

export default {
    name: "PendingRosterItem",
    components: { BaseRosterItem, Icon },
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
