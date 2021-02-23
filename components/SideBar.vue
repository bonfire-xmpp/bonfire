<template>
  <div id="sidebar">
    <v-list id="sidebar-list">
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
#sidebar {
  position: relative;
  display: flex;
  width: 320px;
  min-width: 320px;
  height: 100%;
  background: #1e1e1e;
  padding: 4px;
  box-sizing: border-box;
  &-list {
    overflow: hidden scroll;
    width: 100%;
    background: #1e1e1e;
    padding: 4px;
  }
}
</style>