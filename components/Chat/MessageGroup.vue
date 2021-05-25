<template functional>
  <div class="mb-2">
    <message v-for="(message, i) in props.group" :key="i"
             :heading="i === 0" darken-on-hover
             :from="message.from" :body="message.body" :timestamp="message.timestamp"/>
  </div>
</template>

<script>
import Message from "@/components/Chat/Message";
import HeadingMessage from "@/components/Chat/Message/HeadingMessage";
import BodyMessage from "@/components/Chat/Message/BodyMessage";

export default {
  name: "MessageGroup",
  components: {Message, HeadingMessage, BodyMessage},
  props: {
    group: Array,
  },
}
</script>
