<template>
  <div class="w-full h-full flex justify-center items-start">
    <login-dialog :class="$device.isDesktop ? 'dialog mt-36 h-auto' : 'w-full h-full'"/>
  </div>
</template>

<script>
import LoginDialog from "@/components/Login/LoginDialog";

import Store from '@/store';
import {store} from "@/vuex";

export default {
  name: "login",
  components: {LoginDialog},
  layout: "fullscreen",

  async beforeRouteEnter() {
    // You're logged in; you have no business being here. Scram
    if (store.getters[Store.$getters.loggedIn]) {
      return '/';
    }


    // Try restoring a saved session and logging in that way
    await store.dispatch(Store.$actions.tryRestoreSession);

    // If we logged in that way, redirect to /
    if (store.getters[Store.$getters.loggedIn])
      return '/';
  },
}
</script>

<style scoped>
  .dialog {
    width: 400px;
  }
</style>
