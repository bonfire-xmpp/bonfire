<template>
  <div class="message d-flex align-center">
    <span class="time unselectable ma-0" :class="[showTime ? '' : 'hidetime']">
      {{time}}
    </span>
    <span class="mx-2"/>
    <span>{{body}}</span>
  </div>
</template>

<style lang="scss">
.message {
  white-space: normal;
  border-radius: 3px;
  .time {
    width: 50px;
    font-size: 12px;
    visibility: hidden;
  }
  &:hover {
    .time:not(.hidetime) {
      visibility: visible !important;
    }
    background: darken(map-get($greys, "100"), 5%) !important;
  }
}
</style>

<script>
export default {
  name: "Message",
  props: {
    jid: String,
    body: String,
    time: String,
    showTime: {
      default: true,
      type: Boolean,
    },
  },
  methods: {
    formatTime (date) {
      let hours = date.getHours();
      let ampm = "AM";
      if (hours > 12) {
        ampm = "PM";
        hours -= 12;
      }
      return `${hours}:${date.getMinutes().toString().padStart(2, "0")} ${ampm}`;
    },
  },
}
</script>