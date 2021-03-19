<template>
  <div class="result mx-2 rounded pa-1">
    <message heading :from="result.from" :body="result.body" :timestamp="result.timestamp"/>
  </div>
</template>

<script>
  import Message from "@/components/Chat/Message";

  export default {
    name: "SearchResult",
    components: {Message},
    props: {
      result: Object,
    },
  }
</script>

<style scoped lang="scss">
  .result {
    background-color: map-get($greys, "200");
  }
</style>
