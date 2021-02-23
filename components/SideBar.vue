<template>
  <div class="sidebar d-flex">
    <v-list dense color="grey-100" class="sidebar-list pa-1 flex-grow-1">
      <v-list-item link v-for="chan in channels" :key="chan">
        <v-list-item-content>
          {{chan}}
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
export default {
  data() {
    return {
      channels: new Array(20).fill(0).map((_, i) => `#channel-${i}`)
    }
  }
}
</script>

<style scoped lang="scss">
  .sidebar {
    width: 320px;
    min-width: 320px;
    &-list {
      overflow: hidden scroll;
    }
  }
</style>
