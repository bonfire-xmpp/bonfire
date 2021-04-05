<template>
  <div class="result mx-2 rounded pa-1">
    <v-btn @click.prevent="jump" class="jump-button" icon><v-icon>mdi-arrow-up</v-icon></v-btn>
    <message heading :from="result.from" :body="result.body" :timestamp="result.timestamp"/>
  </div>
</template>

<script>
  import Message from "@/components/Chat/Message";
  import HeadingMessage from "@/components/Chat/Message/HeadingMessage";

  export default {
    name: "SearchResult",
    components: {Message, HeadingMessage},
    props: {
      result: Object,
    },
    methods: {
      jump () {
        this.$emit("jump-to", this.result.timestamp);
      },
    },
  }
</script>

<style scoped lang="scss">
  .result {
    position: relative;
    background-color: map-get($greys, "200");
    .jump-button {
      position: absolute;
      top: 0;
      bottom: 0;
      margin-top: auto;
      margin-bottom: auto;
      right: 10px;
    }
    &:not(:hover) .jump-button {
      visibility: hidden;
    }
  }

</style>
