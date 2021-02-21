<template>
  <login-dialog class="dialog" @login="submit" :loading="loading && !loggedIn" />
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
      }
    },
    methods: {
      submit({jid, password}) {
        this.loading = true;
        this.login({jid, password});

        this.$stanza.client.on("auth:success", () => this.$router.push('/loggedIn'));
      },

      ...mapActions({
        'login': Store.$actions.login,
      })
    },

    computed: {
      ...mapState({
        'loggedIn': Store.$states.loggedIn,
      })
    }
  }
</script>

<style scoped>
  .dialog {
    width: 400px;
    margin: 12vh auto auto;
  }
</style>
