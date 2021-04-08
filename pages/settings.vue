<template>
  <div class="main w-100 h-100">

    <!--Left hand side-->
    <div class="menu">

      <!--X exit button-->
      <v-btn icon outlined @click="$router.back();" class="exit-button d-inline" color="grey-700">
        <v-icon size="1.33rem" color="white">mdi-close</v-icon>
      </v-btn>

      <!--List of submenus-->
      <overlay-scrollbars class="narrow-scrollbar h-100"
        :options="{scrollbars: {autoHide: 'leave', autoHideDelay: 0}}">
        <settings-menu-list :menu-list="menuList" v-model="selectedSubmenu"/>
      </overlay-scrollbars>
    </div>


    <!--Right hand side scrollbar-->
    <overlay-scrollbars class="h-100 panel">

      <!--Show the selected panel on the rhs-->
      <div class="ml-8 pb-16" style="margin-right: 15vw;">
        <keep-alive>
          <component :is="selectedSubmenu"/>
        </keep-alive>
      </div>

    </overlay-scrollbars>

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

.panel {
  height: 100vh;
}
</style>
