<template>
  <base-roster-item :item="item" :selected="selected">

    <template #options>
      <v-btn icon small color="white">
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </template>

  </base-roster-item>
</template>

<script>
  import BaseRosterItem from '@/components/Roster/RosterItem/BaseRosterItem';

  export default {
    name: "MoreRosterItem",
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
