<template>
  <div class="body-message flex px-4 text-white w-100" :class="{'darken-on-hover': darkenOnHover}">

    <div class="gutter flex-shrink-0 unselectable">
      <span class="timestamp text-grey-600">{{formatTime(new Date(props.timestamp))}}</span>
    </div>

    <div class="ml-4 content">{{body.trim()}}</div>
  </div>
</template>

<script>
export default {
  name: "BodyMessage",
  props: {
    from: String,
    body: String,
    timestamp: [String, Number],
    showTime: {
      default: true,
      type: Boolean,
    },
    showFullJid: {
      default: false,
      type: Boolean,
    },
    darkenOnHover: {
      default: false,
      type: Boolean,
    }
  },

  methods: {
    formatTime(date) {
      let hours = date.getHours();

      const ampm = hours > 12 ? 'PM' : 'AM';
      hours = hours % 12;

      return `${hours.toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")} ${ampm}`;
    },
  }
}
</script>

<style scoped lang="scss">
@import "message";
</style>
