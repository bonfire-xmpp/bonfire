<template>
  <icon :class="state + '--text'" :size="10">mdi-circle</icon>
</template>

<script>
  export default {
    name: "StatusIcon",
    props: {
      online: Boolean,
      away: Boolean,
      xa: Boolean,
      dnd: Boolean,
      offline: Boolean,
      status: [String, Number],
    },

    computed: {
      state() {
        if(typeof this.status === 'number')
          return this.$stanza.getOnlineStateFromRank(this.status)
        else if(typeof this.status === 'string')
          return this.status;
      },
    },
  }
</script>
