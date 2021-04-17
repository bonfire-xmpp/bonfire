<template>
  <v-app dark v-if="stanzaInitialized">
    <div id="app" class="d-flex flex-column black" :class="{mobile: $device.isMobileOrTablet, tablet: $device.isTablet}">

      <system-bar v-if="displayTitlebar" dark class="grey-100 material-shadow" style="z-index: 11;"/>

      <div :style="mainTitlebarCompensation" class="d-flex flex-row flex-nowrap main-container position-relative"
           ref="content" @scroll="scrolled" @touchend="mouseup">

        <!--To achieve a scroll effect (see: .mobile .sidebar), the sidebar is removed from flow-->
        <!--So, to keep its width reserved, we insert a dummy element over it and pass through clicks-->
        <div v-if="$device.isMobileOrTablet" class="d-flex">
          <!--Drag-to-scroll and click-catcher-->
          <div class="unselectable sidebar" style="position: relative; z-index: 10;"
               @click="passClick" @long-press="passLongpress"/>

          <!--Right-hand side dimmer and click-to-scroll-->
          <div v-if="dim" class="sidebar-peek" @click="scrollToMain"/>
        </div>
        <!--1px on the left edge, used to observe and dim rhs-->
        <div v-if="$device.isMobileOrTablet" v-intersect="observed" class="position-absolute"/>
        <side-bar class="unselectable sidebar" ref="sidebar"/>

        <v-main class="flex-grow-1 main-content position-relative" ref="mainPanel">
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
      isScrolling: false,
      dim: false,
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

    // On Chrome (<=89), horizontally snapped scrolls can be canceled by scrolling vertically.
    // On a phone with multiple fingers available, this is far too easy to be allowed.
    // The solution: detect when scrolling stops -- force a scroll if it didn't stop on an edge
    mouseup() {
      // When you lift your finger, are we still scrolling?
      // If so, we're inertial-scrolling: everything is fine.
      if (this.isScrolling) return;

      // If you've lifted your finger and we're no longer scrolling,
      // check our scroll position
      const distanceToLeftEdge = this.$refs.content.scrollLeft;
      const distanceToRightEdge = Math.floor(this.$refs.content.scrollWidth - distanceToLeftEdge - window.innerWidth)
      if (distanceToLeftEdge && distanceToRightEdge) {
        // The scroll position isn't on one of the edges -- and we're not scrolling:
        // Force a scroll to the closer edge to fix this.
        this.$refs.content.scroll({
          behavior: "smooth",
          // Scroll to closer edge
          left: distanceToLeftEdge < distanceToRightEdge
              ? 0 : this.$refs.content.scrollWidth - window.innerWidth
        });
      }
    },

    scrolled() {
      if(!this.isScrolling) this.isScrolling = true;

      // Rising edge
      // if(!this.scrollDebounce) {}

      // Falling edge
      clearTimeout(this.scrollDebounce);
      this.scrollDebounce = setTimeout(() => {
        this.scrollDebounce = this.isScrolling = undefined;
      }, 150);
    },

    observed(val) {
      // console.log(val);
      this.dim = val[0].isIntersecting;
    },

    scrollToMain() {
      this.$refs.content.scroll({
        behavior: "smooth",
        left: this.$refs.content.scrollWidth - window.innerWidth
      });
    }
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

  $sidebar-mobile-width: 82vw;
  $sidebar-mobile-peek-width: 100vw - $sidebar-mobile-width;
  $sidebar-tablet-width: 320px;
  $sidebar-tablet-peek-width: calc(100vw - #{$sidebar-tablet-width});

  .mobile .sidebar { @include ensure-width($sidebar-mobile-width); }
  .tablet .sidebar { @include ensure-width(320px); }

  .mobile .main-content { width: 100vw; }

  .dim { background: black; filter: opacity(.3); }

  .mobile .sidebar-peek { @include ensure-width($sidebar-mobile-peek-width); }
  .tablet .sidebar-peek { @include ensure-width($sidebar-tablet-peek-width); }
  .sidebar-peek {
    @extend .dim;
    position: absolute;
    right: 0; z-index: 11;
    height: 100%;
  }
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

