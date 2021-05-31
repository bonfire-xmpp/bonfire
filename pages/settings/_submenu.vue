<template>
  <simplebar class="narrow-scrollbar h-100 component"
             data-simplebar-auto-hide="false" data-simplebar-force-visible="true">
    <component class="mx-6" :is="submenu" v-bind="{mobile: true}"/>
  </simplebar>
</template>

<script>
  import Profile from "@/components/Settings/Panels/Profile";
  import About from "@/components/Settings/Panels/About";
  import Privacy from "@/components/Settings/Panels/Privacy";
  import XEPs from "@/components/Settings/Panels/XEPs";

  import {Store} from "@/store";

  import MenuList from "@/assets/settings/menuList";

  export default {
    name: "submenu",
    layout: "mobileMenu",
    components: { Profile, About, Privacy, XEPs },
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
</style>
