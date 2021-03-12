<template>
  <base-roster-item :item="item" :selected="selected">

    <v-btn icon small color="green">
      <v-icon>mdi-check</v-icon>
    </v-btn>
    <v-btn icon small color="red">
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
    }
  }
</script>
