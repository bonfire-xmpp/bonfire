<template>
  <overlay-scrollbars class="h-100 component">
    <component class="mx-6" :is="submenu" v-bind="{mobile: true}"/>
  </overlay-scrollbars>
</template>

<script>
  import About from "@/components/Settings/Panels/About";
  import Privacy from "@/components/Settings/Panels/Privacy";
  import XEPs from "@/components/Settings/Panels/XEPs";

  import {Store} from "@/store";

  import MenuList from "@/assets/settings/menuList";

  export default {
    name: "submenu",
    layout: "mobileMenu",
    components: {About, Privacy, XEPs},
    computed: {
      submenu() {
        return this.$route.params.submenu;
      },

      title() {
        for (const group of MenuList) {
          const item = group.content.filter(x => x.to === this.$route.params.submenu)[0];
          if(item) return item.title;
        }

        return '';
      }
    },
    mounted() {
      this.$store.commit(Store.$mutations.setPageTitle, this.title);
    }
  }
</script>

<style scoped lang="scss">
.component { background: map-get($black, "lighten") !important; }

// <overlay-scrollbars/> loses all its padding when destroyed, causing a visual jump
// The solution: use margins. Unfortunately, one of its inner elements has a top padding, which we disable here.
*::v-deep .os-content { padding-top: 0 !important; }
</style>
