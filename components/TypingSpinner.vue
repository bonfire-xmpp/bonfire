<!-- Adapted from https://loading.io/css/; provided under the CC0 license. -->

<template>
  <div class="lds-facebook d-flex align-center rounded-pill" :class="{[color]: color, darken: !!color}">
    <div v-for="i in 3" :key="i" class="white"/>
  </div>
</template>

<script>
  export default {
    name: 'TypingSpinner',
    props: {
      color: String,
    }
  }
</script>

<style scoped lang="scss">
$time: 1.0s;

@mixin lds($size) {
  &.lds-facebook {
    display: inline-block;
    position: relative;
    width: $size * 6;
    height: 1em;
    padding: 0;
    margin: 0;
    div {
      //background: map-get($greys, "900");
      //background: map-get($white, "base");
      //background: map-get($greys, "200");
      background: #FFF;
      display: inline-block;
      position: absolute;
      width: $size;
      height: $size;
      border-radius: 50%;
      animation: lds-facebook $time cubic-bezier(0, 0.5, 0.5, 1) infinite;
      &:nth-child(1) {
        left: $size;
        animation-delay: -$time * 0.2;
      }
      &:nth-child(2) {
        left: $size * 2.5;
        animation-delay: -$time * 0.1;
      }
      &:nth-child(3) {
        left: $size * 4;
        animation-delay: -$time * 0.0;
      }
    }
  }

  @keyframes lds-facebook {
    0%, 100% { opacity: 0.0; }
    50% { opacity: 1.0; }
  }
}

.darken {
  position: relative;
  &::before {
    position: absolute;
    content: "";

    width: 100%;
    height: 100%;

    border-radius: 9999px;
    background: map-get($black, "base");

    opacity: 0.25;
    z-index: 1;
  }

  & > * {
    z-index: 2;
  }
}

.normal {
  @include lds(.8em);
}
.small {
  @include lds(4px);
  background: map-get($greys, "200");
  //border-radius: 8px;
  //height: 4px * 4 !important;
}
</style>
