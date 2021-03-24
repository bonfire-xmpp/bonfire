<template>
  <div class="badge-container">
    <slot/>
    <div class="badge-wrapper w-100 h-100">
      <div class="badge" :class="{dot: !$slots.badge}">
        <slot name="badge">
          <div class="dot" :class="color"
            :style="{borderColor, borderStyle: bordered && 'solid'}" />
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Badge",
    props: {
      color: String,
      bordered: Boolean,
      borderColor: String,
    },
  }
</script>

<style scoped lang="scss">
  .badge-container, .badge-wrapper {
    position: relative;
  }

  .badge-wrapper {
    //display: inline;
  }

  .badge {
    position: absolute;
    bottom: 0; right: -15%;
    //font-size: 12px;
    font-size: .75rem;
  }

  .dot {
    display: inline-block;
    //position: absolute;

    width: $badge-dot-width;
    height: $badge-dot-height;
    border-radius: $badge-dot-width;
    border-width: $badge-dot-border-width;

    transform: scale(1.1);

    right: -$badge-dot-border-width;
    //bottom: -$badge-dot-border-width;
  }
</style>
