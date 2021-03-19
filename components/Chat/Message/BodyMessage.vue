<template>
  <div class="body-message d-flex px-4 white--text w-100">

    <div class="gutter flex-shrink-0 unselectable">
      <span class="timestamp grey-600--text">{{formatTime(new Date(timestamp))}}</span>
    </div>

    <div class="ml-4 content">{{messageBody}}</div>
  </div>
</template>

<script>
export default {
  name: "BodyMessage",
  props: {
    from: String,
    body: String,
    timestamp: String | Number,
    showTime: {
      default: true,
      type: Boolean,
    },
    showFullJid: {
      default: false,
      type: Boolean,
    }
  },

  computed: {
    messageBody() {
      return this.body.trim();
    }
  },

  methods: {
    formatTime(date) {
      let hours = date.getHours();

      let ampm = hours > 12 ? 'PM' : 'AM';
      hours = hours % 12;

      return `${hours.toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")} ${ampm}`;
    },
  },
}
</script>

<style scoped lang="scss">
  .body-message {
    min-height: 1.5rem;

    &:hover {
      background: darken(map-get($greys, "200"), 3%) !important;
    }

    &:not(:hover) .timestamp { display: none; }
  }

  .gutter {
    width: 40px;
  }

  .content {
    font-weight: 300;
    overflow-wrap: anywhere;
    white-space: pre-line;
  }

  .timestamp {
    font-size: .75em;
  }
</style>
