<template functional>
  <badge :color="props.color" :border-color="props.borderColor" bordered>
    <avatar :size="props.size" :jid="props.jid"/>
    <template #badge>
      <slot/>
    </template>
  </badge>
</template>

<script>
  export default {
    name: "BadgedAvatar",
    props: {
      size: Number,
      jid: String,
      color: String,
      borderColor: String,
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
