<template>

</template>

<script>
  export default {
    name: "logout",
    middleware({ $stanza, redirect }) {
      $stanza.logout();
      return redirect('/login');
    }
  }
</script>

<style scoped>

</style>
