<template>
  <div class="main lhs-bg w-100 h-100" v-if="!$device.isMobileOrTablet">

    <!--Left hand side-->
    <div class="menu">

      <!--X exit button-->
      <v-btn icon outlined @click="$router.back();" class="exit-button d-inline" color="grey-700">
        <v-icon size="1.33rem" color="white">mdi-close</v-icon>
      </v-btn>

      <!--List of submenus-->
      <simplebar class="simplebar narrow-scrollbar" data-simplebar-auto-hide="false" data-simplebar-force-visible="true">
        <settings-menu-list class="narrow-menu" :menu-list="menuList" v-model="selectedSubmenu"/>
      </simplebar>
    </div>


    <!--Right hand side scrollbar-->
    <simplebar class="simplebar wide-scrollbar h-100 panel rhs-bg rhs">

      <!--Show the selected panel on the rhs-->
      <div class="ml-8 pb-16" style="margin-right: 10vw;">
        <component :is="selectedSubmenu"/>
      </div>

    </simplebar>

  </div>

  <div v-else class="lhs-bg w-100 h-100">
    <simplebar class="simplebar wide-scrollbar h-100"
               data-simplebar-auto-hide="false" data-simplebar-force-visible="true">

      <settings-menu-list class="lhs-bg" mobile :menu-list="menuList" v-model="selectedSubmenu"/>

    </simplebar>
  </div>
</template>

<script>
import MenuList from 'assets/settings/menuList.js';

import SettingsMenuList from '@/components/Settings/MenuList';

import About from "@/components/Settings/Panels/About";
import Privacy from "@/components/Settings/Panels/Privacy";
import XEPs from "@/components/Settings/Panels/XEPs";
import {Store} from "@/store";

export default {
  name: "settings",
  layout(ctx) {
    return ctx.$device.isMobileOrTablet ? "mobileMenu" : "fullscreen";
  },
  components: {SettingsMenuList, About, Privacy, XEPs},
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

.simplebar {
  @include ensure-height(100%);
}

.main {
  display: grid;
  // 1:2 split, or shrink left side no less than min-content
  grid-template-columns: minmax(min-content, 1fr) 2fr;
}

.menu {
  @include ensure-height(100%);

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
  @include ensure-height(100%);
}

.narrow-menu {
  @include ensure-width(200px);
}
</style>
