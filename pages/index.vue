<template>

</template>

<script>
  import { Store } from '@/store';
  import { mapState } from 'vuex';

  export default {
    name: "index",
    computed: {
      ...mapState({
        loggedIn: Store.$states.loggedIn,
      })
    },

    mounted() {
      if(!this.loggedIn) this.$router.push('/login');
    }
  }
</script>

<style scoped>

</style>
