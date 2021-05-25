<template functional>
  <badge :color="props.color" :border-color="props.borderColor" bordered :class="[data.class, data.staticClass]" @click="listeners.click && listeners.click($event)">
    <avatar :size="props.size" :jid="props.jid" @click="listeners.click && listeners.click($event)"/>
    <template #badge>
      <slot @click="listeners.click && listeners.click($event)"/>
    </template>
  </badge>
</template>

<script>
  export default {
    name: "BadgedAvatar",
    props: {
      size: {
        type: Number,
        default: 36
      },
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
