<template>
  <v-card flat outlined color="grey-400" class="unselectable"
          :style="'--xep-animation-delay: ' + Math.random()*300 + 'ms'"
          :class="{'blink-online': supported}">
    <v-card-title class="white--text py-2 d-inline-block w-100">
      <v-chip class="float-right mb-1 ml-3" outlined pill>
        <span class="on-text">{{ supported ? 'ON' : 'OFF' }}</span>
      </v-chip>
      <div class="title-text h-100"><b class="text-monospace">{{no}}</b> &mdash; {{name}}</div>
    </v-card-title>

    <v-divider class="mb-n2 mt-n1"/>

    <v-card-text class="align-self-end" v-html="desc"></v-card-text>

    <v-card v-if="warning" flat color="warning" class="ma-2">
      <v-card-title class="py-2 d-inline-block title-text"><v-icon size="1.2em" left>mdi-alert-circle-outline</v-icon>Warning!</v-card-title>
      <v-divider class="mb-n2 mt-n1"/>
      <v-card-text class="align-self-end" v-html="warning"></v-card-text>
    </v-card>
  </v-card>
</template>

<script>
export default {
  name: "XEPCell",
  props: {
    supported: Boolean,
    no: String,
    name: String,
    desc: String,
    warning: String,
  },
}
</script>

<style scoped lang="scss">

.title-text {
  word-break: break-word;
  font-weight: 700;
  line-height: 1.7em;
  font-size: 1.1em;
}

.text-monospace { font-family: monospace; }

.on-text {
  font-weight: 900 !important;
}

$xep-cell--background-color--on: lighten(transparentize(map-get($green, "lighten"), 0.6), 10);
$xep-cell--background-color--off: map-get($greys, "400");

.v-card.v-card--flat {
  border-color: map-get($greys, "500") !important;
}

.v-card__title {
  font-size: 1em;
}

.v-card__title > span.v-chip.v-chip--pill {
  background-color: transparentize(white, .8) !important;
}


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

.blink-online {
  &.v-card.v-card--flat {
    border-color: map-get($green, "lighten") !important;
    .on-text {
      //color: lighten(map-get($green, "lighten"), 15);
    }

    @include two-layer-background(transparent, $xep-cell--background-color--on);
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
