<template>
  <div class="white--text" :class="{'mt-2': mobile}">
    <panel-title v-if="!mobile">Privacy</panel-title>

    <toggle setting="activeChatReceipts" name="Send Typing Receipts" subtitle="Enabling this will send a receipt to people you are chatting with that shows you are typing."/>
    <v-divider class="my-4"/>
    <toggle setting="messageReadReceipts" name="Send Message Read Receipts" subtitle="Enabling this will let other people see which of their messages you've seen."/>
    <v-divider class="my-4"/>
    <toggle setting="sendTypingReceipts" name="Send Active Chat Receipts" subtitle="Enabling this will let other people know if you have a chat with them open."/>

  </div>
</template>

<script>
  import Toggle from "./UI/Toggle";
  import PanelTitle from "./UI/PanelTitle";

  export default {
    name: "privacy",
    components: {Toggle, PanelTitle},
    props: ['mobile'],
  }
</script>

<style scoped lang="scss">
</style>
