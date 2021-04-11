<template functional>
  <div class="menu-group-item white--text">

    <nuxt-link v-if="props.item.type === 'nuxt'" class="reset-link lighten-on-hover rounded d-block my-1 px-2"
               :style="`color: ${props.item.color} !important`" :to="props.item.to">
      {{ props.item.title }}
    </nuxt-link>

    <div v-else-if="props.item.type === 'submenu'" class="unselectable clickable lighten-on-hover rounded my-1 px-2"
         :style="`color: ${props.item.color} !important`" :aria-selected="props.selected" @click="listeners.select(props.item.to)">
      {{ props.item.title }}
    </div>

  </div>
</template>

<script>
  export default {
    name: "SettingsMenuListItem",
    props: {
      item: Object,
      selected: {
        type: Boolean,
        default: false,
      }
    }
  }
</script>

<style scoped lang="scss">
// .lighten-on-hover sets the 'background' with a ::before, so we rounded that here
.rounded:before {
  border-radius: 4px;
}

.lighten-on-hover[aria-selected] {
  background: map-get($greys, "300");
  &:hover:before { background: inherit; }
}
</style>
