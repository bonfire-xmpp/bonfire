<template>
  <v-app dark v-if="stanzaInitialized">
    <div id="app" class="d-flex flex-column black" :class="{mobile: $device.isMobileOrTablet, tablet: $device.isTablet}">

      <system-bar v-if="displayTitlebar" dark class="grey-100 material-shadow" style="z-index: 11;"/>

      <div :style="mainTitlebarCompensation" class="d-flex flex-row flex-nowrap main-container"
           ref="content"
           @scroll="scrolled" @touchstart="mousedown" @touchend="mouseup">

        <!--To achieve a scroll effect (see: .mobile .sidebar), the sidebar is removed from flow-->
        <!--So, to keep its width reserved, we insert a dummy element over it and pass through clicks-->
        <div v-if="$device.isMobileOrTablet"
             class="unselectable sidebar" style="position: relative; z-index: 10;"
             @click="passClick" @long-press="passLongpress"/>
        <side-bar class="unselectable sidebar" ref="sidebar"/>

        <v-main class="flex-grow-1 main-content" ref="mainPanel">
          <nuxt class="nuxt"/>
        </v-main>

      </div>

    </div>
  </v-app>
</template>

<script>
import SystemBar from "@/components/SystemBar";
import { Store } from "@/store";

export default {
  layout: 'default',
  components: {SystemBar},
  data() {
    return {
      scrollDebounce: null,
      mouseIsHeldDown: false,
    }
  },
  methods: {
    passClick(e) {
      // console.log('click', e, this.$refs.sidebar.$el);
      document.elementsFromPoint(e.clientX,e.clientY)[1].click()
    },
    passLongpress(e) {
      // console.log('longpress', e);
      document.elementsFromPoint(e.detail.clientX,e.detail.clientY)[1]
          .dispatchEvent(new CustomEvent('long-press', e.detail));
    },

    mousedown() { this.mouseIsHeldDown = true; },
    mouseup() { this.mouseIsHeldDown = false; },

    // On Chrome (<=89), horizontally snapped scrolls can be canceled by scrolling vertically.
    // On a phone with multiple fingers available, this is far too easy to be allowed.
    // The solution: detect when scrolling stops -- force a scroll if it didn't stop on an edge
    scrolled() {
      // The user is still holding to scroll
      if(this.mouseIsHeldDown) return;

      // Rising edge
      // if(!this.scrollDebounce) {}

      // Falling edge
      clearTimeout(this.scrollDebounce);
      this.scrollDebounce = setTimeout(() => {
        this.scrollDebounce = undefined;

        // scrollLeft is 0 on left edge
        // scrollWidth - scrollLeft is remaining space to the right,
        //  >= viewport width means we haven't reached right edge
        const distanceToRightEdge = Math.floor(this.$refs.content.scrollWidth - this.$refs.content.scrollLeft - window.innerWidth)
        if(this.$refs.content.scrollLeft && distanceToRightEdge) {
          this.$refs.content.scroll({
            behavior: "smooth",
            // Scroll to closer edge
            left: this.$refs.content.scrollLeft < distanceToRightEdge
                ? 0 : this.$refs.content.scrollWidth - window.innerWidth
          });
        }
      }, 300);
    },
  },
  computed: {
    displayTitlebar() {
      return !!window.api;
    },
    mainTitlebarCompensation() {
      // TODO: Sass <=> JS variable interop is, at best, undocumented.
      // TODO: A Nuxt module that both generates Sass variables and injects them into the context would be required here
      // TODO: $systembar-height
      return this.displayTitlebar ? 'height: calc(100vh - 24px);' : 'height: 100vh;';
    },
    stanzaInitialized () {
      return this.$store.state[Store.$states.stanzaInitialized];
    },
  },
}
</script>

<style lang="scss" scoped>
  .click-catcher {
    position: absolute; z-index: 100;
    width: 100vw; height: 100vh;
  }

  ::-webkit-scrollbar {
    display: none;
  }

  #app.mobile .main-container {
    scroll-snap-type: x mandatory;
    overflow-x: scroll;
    overflow-y: hidden;

    //pointer-events: none;

    // hide scrollbar
    scrollbar-width: none;

    & > * {
      scroll-snap-stop: always;
      scroll-snap-align: end;
    }
  }

  .nuxt { position: absolute; width: 100%; height: 100%; }
  .mobile .nuxt { width: 100vw; }

  // On mobile layouts, make the main panel look like it's getting
  // 'moved out of the way' by sticking the sidebar to the left viewport edge.
  .mobile .sidebar {
    position: fixed;
    left: 0; height: 100%;
    z-index: 9;
  }
  .mobile .main-content {
    position: relative;
    z-index: 10;
  }

  .mobile .sidebar { @include ensure-width(90vw); }
  .tablet .sidebar { @include ensure-width(320px); }

  .mobile .main-content { width: 100vw; }

</style>

<style lang="scss">
  #app {
    // Ensures the app container takes up just one screenful
    position: absolute;
    width: 100vw;
    height: 100vh;

    // Clips out everything that doesn't fit in the container
    overflow: hidden;

    // Solves some edge cases where on reload/HMR the view is stuck scrolled halfway
    left: 0;
    top: 0;

    scroll-behavior: smooth;
  }
</style>

