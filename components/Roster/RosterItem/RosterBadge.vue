<template>
  <div class="roster-badge">
    <slot/>
    <div class="badge">
      <slot name="badge"/>
    </div>
  </div>
</template>

<style scoped lang="scss">
.roster-badge {
  display: block;
  position: relative;
}

.badge {
  position: absolute;
  bottom: -11px;
  right: -11px;
  width: 24px;
  height: 24px;
  z-index: 100;
  padding: 0px;
  margin: 0px;
  * {
    display: block;
    margin: auto;
    left: auto;
    right: auto;
    top: auto;
    bottom: auto;
  }
}

</style>

<script>

export default {
  props: {
    color: {
      type: String,
      optional: false,
      default: 'black',
    },
  },
}

</script>