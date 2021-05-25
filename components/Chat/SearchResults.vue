<template>
  <div class="search-menu grey-100 py-2" :class="{hidden}">
    <simplebar class="narrow-scrollbar pr-1 w-100"
               data-simplebar-auto-hide="false" data-simplebar-force-visible="true">
      <div class="d-block w-100 h-100">
        <search-result v-for="match in results" :key="match.id" :result="match" class="mb-2"/>
      </div>
    </simplebar>
  </div>
</template>

<script>
import SearchResult from "@/components/Chat/SearchResult";

export default {
  name: "SearchResults",
  components: {SearchResult},
  props: {
    results: Array,
    hidden: Boolean,
  },
  data() {
    return {
    }
  }
}
</script>

<style scoped lang="scss">
.search-menu {
  @include ensure-width($chat-search-results-width);

  &:not(.hidden) {
    display: none;
  }
}
</style>
