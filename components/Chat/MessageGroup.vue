<template>
  <div class="mb-2">
    <message v-for="(message, i) in group" :key="'m' + message.timestamp"
             :heading="i === 0" darken-on-hover
             :from="message.from" :body="message.body" :timestamp="message.timestamp"/>
  </div>
</template>

<script>
import Message from "@/components/Chat/Message";

export default {
  name: "MessageGroup",
  components: {Message},
  props: {
    group: Array,
  },
}
</script>
