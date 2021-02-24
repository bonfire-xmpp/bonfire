<template>
  <login-dialog class="dialog"
                @login="submit"
                :loading="loggingIn"
                :both-field-errors="bothFieldErrors"
                :jid-field-errors="jidFieldErrors"
  />
</template>

<script>
  import LoginDialog from "../components/Login/LoginDialog";

  import { Store } from '@/store';
  import { mapState, mapActions } from "vuex";

  export default {
    name: "login",
    components: {LoginDialog},

    async middleware({store, redirect}) {
      // You're logged in; you have no business being here. Scram
      if(store.state[Store.$states.loggedIn]) {
        return redirect('/');
      }


      // Try restoring a saved session and logging in that way
      await store.dispatch(Store.$actions.tryRestoreSession);

      // If we logged in that way, redirect to /
      if(store.state[Store.$states.loggedIn])
        return redirect('/');
    },

    methods: {
      async submit({jid, password, transports}) {
        await this.login({jid, password, transports});
        if(this.loggedIn) return this.redirect('/');
      },

      ...mapActions({
        'login': Store.$actions.login,
      })
    },

    computed: {
      ...mapState({
        'loggedIn': Store.$states.loggedIn,
        'loggingIn': Store.$states.loggingIn,
        'loginFailed': Store.$states.loginFailed,
        'authFailed': Store.$states.authFailed,
      }),

      bothFieldErrors() {
        return (!this.authFailed && this.loginFailed) ? 'Invalid JID or password' : null;
      },

      jidFieldErrors() {
        return this.authFailed ? "Couldn't connect to server" : null;
      },
    },
  }
</script>

<style scoped>
  .dialog {
    width: 400px;
    margin: 12vh auto auto;
  }
</style>
