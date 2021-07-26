<template>
  <main v-if="!mobile" class="menu-content px-2 ml-auto">

    <div class="menu-group" v-for="(group, i) in menuList" :key="i">
      <div class="menu-group-header unselectable mx-2 text-grey-700" v-if="group.header">
        {{ group.header.toLocaleUpperCase() }}
      </div>

      <div class="menu-group-items">
        <settings-menu-list-item v-for="(item, i) in group.content" :key="i"
                                 :item="item" :selected="item.to === selected"
                                 @select="select"/>
      </div>

      <hr class="mx-2 my-2"/>
    </div>

    <slot/>
  </main>

  <nav v-else>

<!--    <v-list subheader nav flat class="lhs-bg px-0 mt-1 text-white">-->
<!--      <v-list-item-group v-for="(group, i) in menuList" :key="i" class="lh-36">-->
<!--        <panel-title v-if="group.header && i !== 0" class="px-6">{{group.header}}</panel-title>-->

<!--        <v-divider v-else-if="i !== 0" class="my-2"/>-->

<!--        <v-list-item v-for="(item, j) in group.content" :key="j"-->
<!--                     append nuxt :to="item.to" class="px-6">-->
<!--          <v-list-item-title :style="{color: item.color}" :class="item.color || 'text-white'">{{item.title}}</v-list-item-title>-->
<!--        </v-list-item>-->
<!--      </v-list-item-group>-->
<!--    </v-list>-->

  </nav>
</template>

<script>
import SettingsMenuListItem from '@/components/Settings/MenuList/Item'

export default {
    name: "MenuList",
    components: { SettingsMenuListItem },
    props: {
      menuList: Array,
      selected: String,
      mobile: {
        type: Boolean,
        default: false,
      }
    },

    // data() {
    //   return {
    //     selectedSubmenu: null,
    //   }
    // },
    //
    // computed: {
    //   selected: {
    //     get() { return this.selectedSubmenu || this.value },
    //     set(val) { this.selectedSubmenu = val; }
    //   }
    // },

    methods: {
      select(to) {
        // this.selected = to;
        this.$emit('update:selected', to);
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

.lhs-bg { background: map-get($black, "lighten") !important; }
.lh-36 > *:not(.v-divider) { @include ensure-height(2.25em); }
</style>
