<template>
  <v-container class="d-flex flex-grow-1 flex-column flex-nowrap justify-space-between">
    <div><h1>{{this.$route.params.entity}}</h1></div>
    <div ref="messageList" class="flex-grow-1" style="overflow: hidden scroll;">
      <v-card dense flat v-for="mesg in messages" :key="mesg.id">
        {{mesg.from}} - {{mesg.body}}
      </v-card>
    </div>
    <form @submit.prevent="sendMessage">
    <v-text-field 
      outlined dense single-line hide-details 
      class="flex-shrink-1 flex-grow-0"
      v-model="message"
    ></v-text-field>
    </form>
  </v-container>
</template>

<script>
import { mapState } from 'vuex';
import { MessageStore } from '@/store/messages';

export default {
  data () {
    return {
      message: ""
    };
  },
  computed: {
    messages () {
      let list = this.$refs.messageList;
      if (list && (list.scrollHeight - list.scrollTop - list.clientHeight) == 0) {
        setImmediate(() => {
          list.scrollTop = list.scrollHeight;
        });
      }
      return this.$store.state
        [MessageStore.namespace]
        [MessageStore.$states.messages]
        [this.$route.params.entity];
    }
  },
  methods: {
    sendMessage () {
      this.$stanza.client.sendMessage({
        type: "chat", 
        to: this.$route.params.entity, 
        body: this.message
      });
    }
  },
}
</script>