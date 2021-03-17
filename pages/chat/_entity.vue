<template>

</template>

<script>
  import { mapMutations } from 'vuex';
  import { Store } from "@/store";

  export default {
    methods: mapMutations({ setActiveChat: Store.$mutations.setActiveChat }),
    mounted() {
      this.setActiveChat({type: 'chat', entity: this.$route.params.entity});
    }
  }
</script>

