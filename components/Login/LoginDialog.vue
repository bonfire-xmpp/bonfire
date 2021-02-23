<template>
  <v-card :loading="loading">
    <v-container class="pa-6">
      <v-form class="px-5" @submit.prevent="login" ref="form" v-model="valid" lazy-validation>
        <v-container>
          <v-row class="mb-5">
            <h2 class="text-center flex-grow-1">Welcome!</h2>
          </v-row>
          <v-row>
            <v-text-field
                outlined dense
                autofocus
                required
                :error-messages="jidFieldErrors || bothFieldErrors"
                v-model="jid"
                :rules="jidRules"
                label="JID"/>
          </v-row>
          <v-row>
            <v-text-field
                outlined dense
                :error-messages="bothFieldErrors"
                v-model="password"
                type="password"
                label="Password"/>
          </v-row>

          <v-row v-if="customTransportNeeded">
            <v-text-field
                outlined dense
                :rules="[() => !!boshUrl || !!wssUrl || 'This field is required']"
                :error-messages="bothFieldErrors"
                v-model="boshUrl"
                label="BOSH URL"/>
          </v-row>
          <v-row v-if="customTransportNeeded">
            <v-text-field
                outlined dense
                :rules="[() => !!boshUrl || !!wssUrl || 'This field is required']"
                :error-messages="bothFieldErrors"
                v-model="wssUrl"
                label="WebSocket URL"/>
          </v-row>

          <v-row>
            <v-btn block color="primary" type="submit" :disabled="loading" :loading="loading">Log in</v-btn>
            <a class="text-caption text-right flex-grow-1 mt-1" @click="customTransportNeeded = !customTransportNeeded">Need to enter custom transport links?</a>
          </v-row>
        </v-container>
      </v-form>
    </v-container>
  </v-card>
</template>

<script>
  export default {
    name: "LoginDialog",
    props: ['loading', 'bothFieldErrors', 'jidFieldErrors'],
    data() {
      return {
        jidRules: [
            jid => /.+@.+/.test(jid) || "Invalid JID"
        ],
        valid: true,
        jid: '',
        password: '',

        customTransportNeeded: false,
        boshUrl: '',
        wssUrl: '',
      }
    },

    methods: {
      login() {
        let options = {jid: this.jid, password: this.password};
        if(this.customTransportNeeded) options = {...options, transports:{bosh:this.boshUrl, websocket:this.wssUrl}}
        this.$refs.form.validate() && this.$emit('login', options);
      }
    },
  }
</script>

<style scoped>

</style>
