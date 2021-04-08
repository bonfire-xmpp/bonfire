<template functional>
  <div class="panel-title unselectable mb-3">
    {{props.title}}
    <slot/>
  </div>
</template>

<script>
export default {
  name: "PanelTitle",
  props: {
    title: {
      type: String,
      required: false,
    },
  },
}
</script>

<style scoped lang="scss">
.panel-title {
  vertical-align: top;
  font-weight: 800;
  text-transform: uppercase;
}
</style>
