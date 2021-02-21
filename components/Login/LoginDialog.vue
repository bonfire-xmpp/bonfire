<template>
  <v-card :loading="loading">
    <v-container class="pa-6">
      <v-form class="px-5" @submit="login" ref="form" v-model="valid">
        <v-container>
          <v-row class="mb-5">
            <h2 class="text-center flex-grow-1">Welcome!</h2>
          </v-row>
          <v-row>
            <v-text-field
                outlined dense
                autofocus
                required
                v-model="jid"
                :rules="jidRules"
                label="JID"/>
          </v-row>
          <v-row>
            <v-text-field
                outlined dense
                required
                v-model="password"
                type="password"
                label="Password"/>
          </v-row>
          <v-row>
            <v-btn block color="primary" type="submit" :disabled="!valid || loading" :loading="loading">Log in</v-btn>
          </v-row>
        </v-container>
      </v-form>
    </v-container>
  </v-card>
</template>

<script>
  export default {
    name: "LoginDialog",
    props: ['loading'],
    data() {
      return {
        jidRules: [
            jid => /.+@.+\..+/.test(jid) || "Invalid JID"
        ],
        valid: true,
        jid: '',
        password: '',
      }
    },
    methods: {
      login(e) {
        e.preventDefault();
        this.$emit('login', {jid: this.jid, password: this.password});
      }
    }
  }
</script>

<style scoped>

</style>
