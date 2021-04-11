<template>
  <div class="main lhs-bg w-100 h-100" v-if="!$device.isMobileOrTablet">

    <!--Left hand side-->
    <div class="menu">

      <!--X exit button-->
      <v-btn icon outlined @click="$router.back();" class="exit-button d-inline" color="grey-700">
        <v-icon size="1.33rem" color="white">mdi-close</v-icon>
      </v-btn>

      <!--List of submenus-->
      <overlay-scrollbars class="narrow-scrollbar h-100"
        :options="{scrollbars: {autoHide: 'leave', autoHideDelay: 0}}">
        <settings-menu-list class="narrow-menu" :menu-list="menuList" v-model="selectedSubmenu"/>
      </overlay-scrollbars>
    </div>


    <!--Right hand side scrollbar-->
    <overlay-scrollbars class="h-100 panel rhs-bg">

      <!--Show the selected panel on the rhs-->
      <div class="ml-8 pb-16" style="margin-right: 15vw;">
        <keep-alive><component :is="selectedSubmenu"/></keep-alive>
      </div>

    </overlay-scrollbars>

  </div>

  <div v-else class="lhs-bg w-100 h-100">
    <overlay-scrollbars class="narrow-scrollbar h-100"
                        :options="{scrollbars: {autoHide: 'leave', autoHideDelay: 0}}">

      <settings-menu-list class="lhs-bg" mobile :menu-list="menuList" v-model="selectedSubmenu"/>

    </overlay-scrollbars>
  </div>
</template>

<script>
import MenuList from 'assets/settings/menuList.js';

import SettingsMenuList from '@/components/Settings/MenuList';

import About from "@/components/Settings/Panels/About";
import Privacy from "@/components/Settings/Panels/Privacy";
import {Store} from "@/store";

export default {
  name: "settings",
  layout(ctx) {
    return ctx.$device.isMobileOrTablet ? "mobileMenu" : "fullscreen";
  },
  components: {SettingsMenuList, About, Privacy},
  data() {
    return {
      menuList: MenuList,
      selectedSubmenu: MenuList[0].content[0].to,
    }
  },
  mounted() {
    this.$store.commit(Store.$mutations.setPageTitle, "User Settings");
  }
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

.lhs-bg { background: map-get($black, "lighten") !important; }
.rhs-bg { background: map-get($greys, "300") !important; }

.panel {
  height: 100vh;
}

.narrow-menu {
  @include ensure-width(200px);
}
</style>
