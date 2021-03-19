<template>
  <heading-message v-if="heading" v-bind="$props"/>
  <body-message v-else v-bind="$props"/>
</template>

<script>
import HeadingMessage from "@/components/Chat/Message/HeadingMessage";
import BodyMessage from "@/components/Chat/Message/BodyMessage";

export default {
  name: "Message",
  components: {HeadingMessage, BodyMessage},
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
    heading: {
      default: false,
      type: Boolean,
    }
  },
}
</script>
