<template>
  <div
      class="d-flex flex-column hide-horizontal grey-100 search-menu"
      :hidden="hidden"
  >
    <!--TODO: factor out-->
    <!--Single Search Result-->
    <div v-for="match in results" :key="match.id" class="mb-4">
      <p class="ma-0 px-2">{{formatTime(new Date(match.timestamp))}}</p>
      <p class="ma-0 px-2 flex-shrink-1" style="white-space: normal;">
        <b>{{$stanza.getLocal(match.from)}}</b> - {{match.body}}
      </p>
    </div>
  </div>
</template>

<script>
  export default {
    name: "SearchResults",
    props: {
      results: Array,
      hidden: Boolean,
    },

    methods: {
      formatTime(date) {
        let hours = date.getHours();

        let ampm = hours > 12 ? 'PM' : 'AM';
        hours = hours % 12;

        return `${hours.toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")} ${ampm}`;
      },
    },
  }
</script>

<style scoped lang="scss">
  .search-menu {
    @include ensure-width($chat-search-results-width);

    transition: .2s;
    &[hidden] {
      margin-right: 0;
    }

    &:not([hidden]) {
      margin-right: -$chat-search-results-width;
    }
  }
</style>
