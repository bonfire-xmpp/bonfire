<template>
  <div class="sidebar grey-100 py-2">
    <roster-item v-for="(item, i) in rosterItems" :item="item" :key="i" :selected="i === 0" class="mb-1"/>
  </div>
</template>

<script>
  import { Store } from "@/store";
  import { mapState } from 'vuex';

  export default {
    computed: {
      ...mapState({
        roster: Store.$states.roster,
      }),

      rosterItems() {
        return this.roster?.items;
      }
    }
  }
</script>

<style scoped lang="scss">
  .sidebar {
    width: 320px;
    min-width: 320px;
    box-shadow: 0px 0px 10px transparentize(black, 0.6);
    z-index: 10;
    &:hover {
      overflow: hidden auto;
    }
    overflow: hidden hidden;
  }
</style>
