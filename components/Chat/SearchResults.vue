<template>
  <div
      class="d-flex flex-column hide-horizontal grey-100 search-menu py-2"
      :hidden="hidden">
    <search-result v-for="match in results" :key="match.id" :result="match" class="mb-2"/>
  </div>
</template>

<script>
  import SearchResult from "@/components/Chat/SearchResult";

  export default {
    name: "SearchResults",
    components: { SearchResult },
    props: {
      results: Array,
      hidden: Boolean,
    },
  }
</script>

<style scoped lang="scss">
  .search-menu {
    @include ensure-width($chat-search-results-width);

    &[hidden] {
      margin-right: 0;
    }

    &:not([hidden]) {
      margin-right: -$chat-search-results-width;
    }
  }
</style>
