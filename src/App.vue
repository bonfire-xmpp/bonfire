<template>
  <ion-app>
    <div id="bonfire" class="flex flex-col bg-black">
      <system-bar v-if="displayTitlebar" dark/>
      <div :style="mainTitlebarCompensation">
        <ion-router-outlet/>
      </div>
    </div>
  </ion-app>
</template>

<style lang="scss">
#bonfire {
  // Ensures the app container takes up just one screenful
  position: absolute;
  width: 100vw;
  height: 100vh;

  // Clips out everything that doesn't fit in the container
  overflow: hidden;

  // Solves some edge cases where on reload/HMR the view is stuck scrolled halfway
  left: 0;
  top: 0;
}
</style>

<script>
import SystemBar from "@/components/SystemBar";
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { defineComponent } from 'vue';

import '@/assets/utilities.scss';
import '@/assets/fonts.scss';
import '@/assets/reset.scss';

export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet,
    SystemBar
  },
  computed: {
    displayTitlebar() {
      return this.$device.isElectron;
    },
    mainTitlebarCompensation() {
      // TODO: Sass <=> JS variable interop is, at best, undocumented.
      // TODO: A Nuxt module that both generates Sass variables and injects them into the context would be required here
      // TODO: $systembar-height
      return this.displayTitlebar ? 'height: calc(100vh - 24px);' : 'height: 100vh;';
    },
  }
});
</script>
