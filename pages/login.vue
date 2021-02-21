<template>
  <login-dialog class="dialog"
                @login="submit"
                :loading="loading && !loggedIn"
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
    data() {
      return {
        loading: false,
        wrongCredentials: false,
        serverConnectionIssues: false,
      }
    },
    methods: {
      submit({jid, password, transports}) {
        this.wrongCredentials = false;
        this.serverConnectionIssues = false;
        this.loading = true;

        this.login({jid, password, transports});

        this.$stanza.client.on("auth:success", () => {
          this.$router.push('/loggedIn')
        });
      },

      failedAuth() {
        this.wrongCredentials = true;
      },

      transportDisconnected() {
        if (this.wrongCredentials) {
          console.warn("Incorrect username or password");
        } else {
          this.serverConnectionIssues = true;
          console.warn("Couldn't connect to XMPP server!");
        }

        this.loading = false;
      },

      ...mapActions({
        'login': Store.$actions.login,
      })
    },

    computed: {
      ...mapState({
        'loggedIn': Store.$states.loggedIn,
      }),

      bothFieldErrors() {
        return this.wrongCredentials ? 'Invalid JID or password' : null;
      },

      jidFieldErrors() {
        return this.serverConnectionIssues ? "Couldn't connect to server" : null;
      },
    },

    mounted() {
      this.$stanza.client.on('auth:failed', this.failedAuth);
      this.$stanza.client.on('--transport-disconnected', this.transportDisconnected);
    },

    destroyed() {
      this.$stanza.client.off('auth:failed', this.failedAuth);
      this.$stanza.client.off('--transport-disconnected', this.transportDisconnected);
    }
  }
</script>

<style scoped>
  .dialog {
    width: 400px;
    margin: 12vh auto auto;
  }
</style>
