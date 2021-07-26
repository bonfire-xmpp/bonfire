<template>
  <div class="header-message flex align-top px-4 text-white" :class="{'darken-on-hover': props.darkenOnHover}">
    <avatar :size="40" :jid="props.from" class="flex-grow-0 mt-1"/>
    <main class="ml-4 h-100 flex flex-col">
      <div class="unselectable">
        <b>{{showFullJid ? from : getLocal(props.from)}}</b>
        <span class="ml-1 text-grey-600 timestamp">{{formatTime(new Date(props.timestamp))}}</span>
      </div>

      <div class="content">{{props.body}}</div>
    </main>
  </div>
</template>

<script>
  import { JID } from '@bonfire-xmpp/verse';
  import Avatar from "@/components/Avatar";

  export default {
    name: "HeadingMessage",
    components: { Avatar },
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

      getLocal(jid){ return JID.getLocal(jid); }
    },
  }
</script>

<style scoped lang="scss">
@import "message";
</style>
