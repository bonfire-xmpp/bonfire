<template>
  <span style="position: relative;">
    <slot :on="open" :off="close" name="activator" class="activator">
    </slot>

    <div class="container ma-0 pa-0" v-click-outside="close" v-if="active">
      <slot :on="open" :off="close" name="default" class="overlay">
      </slot>
    </div>
  </span>
</template>

<style lang="scss" scoped>
  .container {
    position: absolute;
    right: 0px;
    bottom: 48px;
    min-width: fit-content !important;
    min-height: fit-content !important;
    width: auto !important;
    height: auto !important;
    border-radius: 5px;
    & * {
      color: white !important;
    }
  }
</style>

<script>

export default {
  name: "OverlayMenu",

  data () {
    return {
      active: false,
    };
  },

  methods: {
    open () {
      console.log("open");
      this.active = true;
    },
    close () {
      console.log("close");
      this.active = false;
    },
  },
}

</script>