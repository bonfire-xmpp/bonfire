<template>
  <pending-roster-item v-if="approve" :selected="selected" :item="item"/>
  <menu-roster-item v-else-if="menu" :selected="selected" :item="item"/>
</template>

<script>
  import MenuRosterItem from "@/components/Roster/RosterItem/MenuRosterItem";
  import PendingRosterItem from "@/components/Roster/RosterItem/PendingRosterItem";

  export default {
    name: "RosterItem",
    components: { MenuRosterItem, PendingRosterItem },
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
      approve: {
        type: Boolean,
        required: false,
        default: false,
      },
      menu: {
        type: Boolean,
        required: false,
        default: true,
      },
    }
  }
</script>
