<template>
  <base-roster-item :item="item" :selected="selected">

    <v-btn icon small color="green" @click="approve">
      <v-icon>mdi-check</v-icon>
    </v-btn>
    <v-btn icon small color="red" @click="reject">
      <v-icon>mdi-close</v-icon>
    </v-btn>

  </base-roster-item>
</template>

<script>
  import BaseRosterItem from "@/components/Roster/RosterItem/BaseRosterItem";

  export default {
    name: "PendingRosterItem",
    components: { BaseRosterItem },
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
      approve() {
        this.$emit('approve', this.item);
      },

      reject() {
        this.$emit('reject', this.item);
      },
    },
  }
</script>
