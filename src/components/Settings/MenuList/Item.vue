<template>
  <div class="menu-group-item text-white">

    <router-link v-if="item.type === 'nuxt'" class="reset-link lighten-on-hover rounded block my-1 px-2"
               :style="`color: ${item.color} !important`" :to="item.to">
      {{ item.title }}
    </router-link>

    <div v-else-if="item.type === 'submenu'" class="unselectable clickable lighten-on-hover rounded my-1 px-2"
         :style="`color: ${item.color} !important`" :aria-selected="selected" @click="$emit('select', item.to)">
      {{ item.title }}
    </div>

  </div>
</template>

<script>
import { RouterLink } from 'vue-router';

  export default {
    name: "SettingsMenuListItem",
    components: {RouterLink},
    props: {
      item: Object,
      selected: {
        type: Boolean,
        default: false,
      }
    },
    emits: {
      select: String,
    }
  }
</script>

<style scoped lang="scss">
// .lighten-on-hover sets the 'background' with a ::before, so we rounded that here
.rounded:before {
  border-radius: 4px;
}

.lighten-on-hover[aria-selected="true"] {
  background: map-get($greys, "300");
  &:hover:before { background: inherit; }
}
</style>
