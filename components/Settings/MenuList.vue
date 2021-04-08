<template>
  <main class="menu-content px-2 ml-auto">

    <div class="menu-group" v-for="group in menuList">
      <div class="menu-group-header unselectable mx-2 grey-700--text" v-if="group.header">
        {{ group.header.toLocaleUpperCase() }}
      </div>

      <div class="menu-group-items">
        <settings-menu-list-item v-for="(item, i) in group.content" :key="i"
                                 :item="item" :selected="item.to === selected"
                                 @select="select"/>
      </div>

      <v-divider class="mx-2 my-2"/>
    </div>

    <slot/>
  </main>
</template>

<script>
  export default {
    name: "MenuList",
    props: {
      menuList: Array,
      value: String,
    },

    data() {
      return {
        selectedSubmenu: null,
      }
    },

    computed: {
      selected: {
        get() { return this.selectedSubmenu || this.value },
        set(val) { this.selectedSubmenu = val; }
      }
    },

    methods: {
      select(to) {
        this.selected = to;
        this.$emit('input', to);
      }
    },
  }
</script>

<style scoped lang="scss">
.menu-content {
  font-size: 1rem;
  line-height: 2em;

  @include ensure-width(200px);
}

.menu-group-header {
  font-size: 0.8em;
  font-weight: 700;
  line-height: 1;
}
</style>
