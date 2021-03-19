<template>
  <div class="header-message d-flex align-top px-4 white--text" :class="{'darken-on-hover': darkenOnHover}">
    <avatar :size="40" :jid="from" class="flex-grow-0 mt-1"/>
    <main class="ml-4 h-100 d-flex flex-column">
      <div class="unselectable">
        <b>{{jid}}</b>
        <span class="ml-1 grey-600--text timestamp">{{formatTime(new Date(timestamp))}}</span>
      </div>

      <div class="content">{{body}}</div>
    </main>
  </div>
</template>

<script>
  export default {
    name: "HeadingMessage",
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
      },
      darkenOnHover: {
        default: false,
        type: Boolean,
      }
    },

    computed: {
      jid() {
        return this.showFullJid ? this.from : this.$stanza.getLocal(this.from);
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
  .header-message {
    min-height: 3rem;
  }

  .darken-on-hover {
    &:hover {
      background: darken(map-get($greys, "200"), 3%) !important;
    }
  }

  .content {
    font-weight: 300;
    white-space: pre-line;
    overflow-wrap: anywhere;
  }

  .timestamp {
    font-size: .75em;
  }
</style>
