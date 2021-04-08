<template>
  <div class="main w-100 h-100">

    <!--Left hand side-->
    <div class="menu">

      <!--X exit button-->
      <v-btn icon outlined @click="$router.back();" class="exit-button d-inline" color="grey-700">
        <v-icon size="1.33rem" color="white">mdi-close</v-icon>
      </v-btn>

      <!--List of submenus-->
      <settings-menu-list :menu-list="menuList" v-model="selectedSubmenu"/>
    </div>


    <!--Right hand side-->
    <div class="panel pl-8" :style="{'padding-right': $vuetify.breakpoint.mdAndDown ? '42px' : '15vw' }">

      <!--Show the selected panel on the rhs-->
      <keep-alive>
        <component :is="selectedSubmenu"/>
      </keep-alive>

    </div>

  </div>
</template>

<script>
import MenuList from '@/assets/settings/menuList.js';

import About from "@/components/Settings/Panels/About";
import Privacy from "@/components/Settings/Panels/Privacy";

export default {
  name: "settings",
  layout: "fullscreen",
  components: {About, Privacy},
  data() {
    return {
      menuList: MenuList,
      selectedSubmenu: MenuList[0].content[0].to,
    }
  },
}
</script>

<style scoped lang="scss">
$exit-button-total-space: calc(#{$exit-button-size} + #{$exit-button-left-margin}) !default;

.main {
  display: grid;
  // 1:2 split, or shrink left side no less than min-content
  grid-template-columns: minmax(min-content, 1fr) 2fr;
}

.menu {
  display: grid;
  // (Exit Button + Left Margin) | everything else
  grid-template-columns: $exit-button-total-space auto
}

// Top-right alignment -- fake auto left margin
.exit-button {
  place-self: start end;
}

.main > * {
  padding-top: 36px;
}

.menu { background: map-get($black, "lighten"); }
.panel { background: map-get($greys, "300"); }

</style>
