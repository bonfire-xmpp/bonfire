<template>
  <div class="d-flex flex-column flex-nowrap search-menu grey-100 os-host-flexbox py-2">
    <overlay-scrollbars class="pr-1 w-100 flex-grow-1" style="min-height: 0px;"
                        :options="scrollbarSettings">
      <div class="d-block w-100 h-100">
        <search-result v-for="match in page" :key="match.id" :result="match" class="mb-2"/>
      </div>
    </overlay-scrollbars>
    <div class="pt-2">
      <div class="d-flex align-center justify-center w-100 px-4" v-if="hasPages">
        <v-btn icon @click="currentPage = 0" :disabled="currentPage == 0" class="px-4 unselectable">
          <v-icon>mdi-page-first</v-icon>
        </v-btn>
        <v-spacer/>
        <v-btn class="mx-4" icon :disabled="currentPage == 0" @click="back">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <div>{{currentPage + 1}}</div>
        <v-btn class="mx-4" icon @click="next" :disabled="!hasMorePages">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
        <v-spacer/>
        <v-btn icon @click="currentPage = numPages - 1" :disabled="!hasMorePages" class="px-4 unselectable">
          <v-icon>mdi-page-last</v-icon>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import SearchResult from "@/components/Chat/SearchResult";

export default {
  name: "SearchResults",
  components: {SearchResult},
  props: {
    results: Array,
  },
  data() {
    return {
      scrollbarSettings: {
        scrollbars: {
          autoHide: 'leave',
          autoHideDelay: 0,
          clickScrolling: true
        }
      },
      currentPage: 0,
      pageSize: 30,
    }
  },
  computed: {
    hasPages () {
      return this.$props.results.length > this.pageSize;
    },
    hasMorePages () {
      return this.currentPage + 1 < this.numPages;
    },
    numPages () {
      return 1 + Math.floor(this.$props.results.length / this.pageSize);
    },
    page () {
      let idx = this.currentPage * this.pageSize;
      return this.results.slice(idx, idx + this.pageSize);
    }
  },
  methods: {
    next () {
      ++this.currentPage;
    },
    back () {
      --this.currentPage;
    },
  },
}
</script>

<style scoped lang="scss">
.search-menu {
  @include ensure-width($chat-search-results-width);
}
</style>
