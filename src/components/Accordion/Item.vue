<template>
  <div class="flex flex-col accordion-item" :class="{'flex-grow': expanded}">

    <!--Fixed height header-->
    <slot class="accordion--header" name="header">
      <div class="accordion--header px-2 flex align-center clickable text-grey-900 light-shadow"
           style="z-index: 2;"
           @click="$emit('expanded')">
        <span>{{ header }}</span>
        <v-spacer/>
        <icon size="16px" color="grey-900" :style="{ transform: chevronRotation }">mdi-chevron-right</icon>
      </div>
    </slot>

    <!--Fill the rest of the space with the content-->
    <div class="flex-grow flex flex-col"
         style="flex-basis: 0; min-height: 0"
         v-show="expanded">
      <slot/>
    </div>
  </div>
</template>

<script>
import Icon from "@/components/Icon";
export default {
  components: {Icon},
  name: "AccordionItem",
  props: {
    header: String,
    expanded: Boolean,
  },
  computed: {
    chevronRotation() {
      return `rotate(${(this.expanded ? 90 : 0)}deg)`
    },

  },
}
</script>

<style scoped lang="scss">
$accordion-header-height: 2.5em;

.accordion-item {
  will-change: height, flex-grow;
  transition-property: flex-grow;
  transition-duration: .3s;
  transition-timing-function: ease;
}

.accordion--header {
  @include ensure-height($accordion-header-height);
  background-color: map-get($black, "lighten");
  font-weight: 800;
}
</style>
