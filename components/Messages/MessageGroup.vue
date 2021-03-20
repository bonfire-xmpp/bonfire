<template>
  <div class="mb-2">
    <div class="d-flex flex-column groupheader pt-1">
      <div class="d-flex px-4">
        <span class="flex-grow-0" style="width: 50px !important;">
          <avatar :jid="group[0].from" :size="48"/>
        </span>
        <span class="mx-2"/>
        <span class="unselectable">
          {{group[0].from}}
          <span class="ml-1 text--secondary caption">{{formatTime(new Date(group[0].timestamp))}}</span>
        </span>
      </div>
      <message
        v-for="mesg in [group[0]]" 
        style="margin-top: -22px;"
        :key="'msg:' + mesg.timestamp"
        :jid="mesg.from"
        :showTime="false"
        :body="mesg.body"
        :timestamp="mesg.timestamp"/>
      </div>
      <div style="margin-top: -2px;">
      <message
        v-for="mesg in group.slice(1)" 
        :key="'msg:' + mesg.id"
        :jid="mesg.from"
        :body="mesg.body"
        :time="formatTime(new Date(mesg.timestamp))"/>
    </div>
  </div>
</template>

<style lang="scss">
.groupheader {
  &:hover {
    background: darken(map-get($greys, "100"), 5%) !important;
  }
}
</style>

<script>
import Message from "@/components/Messages/Message";

export default {
  name: "MessageGroup",
  components: {Message},
  props: {
    group: Array,
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