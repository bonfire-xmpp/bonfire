<template functional>
  <v-card flat outlined color="grey-400" class="unselectable"
          :disabled="props.disabled"
          :style="'--xep-animation-delay: ' + $options.delay(props.delay) + 'ms'"
          :class="[data.class, data.staticClass, props.supported ? (props.animated ? 'blink-online' : 'supported') : 'unsupported']">
    <v-card-title class="white--text py-2 d-inline-block w-100">
      <v-chip class="float-right mb-1 ml-3" outlined pill>
        <span class="on-text">{{ props.supported ? 'ON' : 'OFF' }}</span>
      </v-chip>
      <div class="title-text h-100"><b class="text-monospace">{{props.no}}</b> &mdash; {{props.name}}</div>
    </v-card-title>

    <v-divider class="mb-n2 mt-n1"/>

    <v-card-text class="align-self-end" v-html="props.desc"></v-card-text>

    <v-card v-if="props.warning" flat color="warning" class="ma-2">
      <v-card-title class="py-2 d-inline-block title-text"><v-icon size="1.2em" left>mdi-alert-circle-outline</v-icon>Warning!</v-card-title>
      <v-divider class="mb-n2 mt-n1"/>
      <v-card-text class="align-self-end" v-html="props.warning"></v-card-text>
    </v-card>
  </v-card>
</template>

<script>
export default {
  name: "XEPCell",
  props: {
    supported: Boolean,
    animated: Boolean,
    disabled: Boolean,
    delay: Number,
    no: String,
    name: String,
    desc: String,
    warning: String,
  },
  delay(delay) {
    return delay === undefined ? Math.random()*300 : delay;
  },
}
</script>

<style scoped lang="scss">
$xep-cell--background-color--on: lighten(transparentize(map-get($green, "lighten"), 0.6), 10);
$xep-cell--background-color--off: map-get($greys, "400");

.title-text {
  word-break: break-word;
  font-weight: 700;
  line-height: 1.7em;
  font-size: 1.1em;
}

//Smaller card header font
.v-card__title {
  font-size: 1em;
}

.text-monospace { font-family: monospace; }

// Pilled ON / OFF text
.on-text {
  font-weight: 900 !important;
}

// Slightly whiter pill background
.v-card__title > span.v-chip.v-chip--pill {
  background-color: transparentize(white, .8) !important;
}

// Vuetify's card background is set as !important,
//  and !important values cannot be changed from animations
// So, the solution is to hide the real background behind a ::before
//  which will assume its role (and will be animatable)
@mixin two-layer-background($deep-background-color, $background-color) {
  & {
    position: relative;
    background: $deep-background-color !important;
  }

  &::before {
    content: "";

    position: absolute;
    width: 100%; height: 100%;

    left: 0; right: 0;

    background: $background-color;
    z-index: 5;
  }

  & > * { position: relative; z-index: 6; }
}

.v-card.v-card--flat {
  // Smooth transition between on/off states
  &:before { transition: background-color .2s; }

  // Green border and background if supported
  &.supported {
    border-color: map-get($green, "lighten") !important;
    @include two-layer-background(transparent, $xep-cell--background-color--on);
  }

  // Regular off border and background color if unsupported
  &.unsupported {
    border-color: map-get($greys, "500") !important;
    @include two-layer-background(transparent, $xep-cell--background-color--off);
  }
}

// Animation-enabled 'on' green background
.blink-online {
  &.v-card.v-card--flat {

    // Green border and background
    @extend .supported;

    // Disable animation on mobile
    #bonfire:not(.mobile) &:before {
      animation: ease-in blink-online .6s;
      animation-delay: var(--xep-animation-delay);
      animation-fill-mode: forwards;
    }
  }
}

@keyframes blink-online {
  from, 10%, 20%, 35%, 55% { background-color: $xep-cell--background-color--off }
  5%, 28%, 62%, to { background-color: $xep-cell--background-color--on }
}
</style>
