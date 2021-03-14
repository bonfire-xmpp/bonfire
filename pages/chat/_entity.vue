<template>
  <div class="d-flex flex-nowrap flex-column flex-grow-1">

    <!-- Header -->
    <v-container fluid style="height: 64px; z-index: 4;" class="unselectable grey-100 d-flex flex-row align-center">
      <user-card :item="currentItem"/>
      <v-spacer/>
      <v-text-field
        @focus="resultsActive = true" @click="resultsActive = true" v-model="searchText"
        @keydown.esc="resultsActive = false; searchText = '';"
        single-line dense solo clearable hide-details 
        label="Search" class="searchbar"
      />
    </v-container>

    <!-- Main Section -->
    <div class="d-flex flex-nowrap flex-row flex-grow-1 hide-overflow">
      <v-container class="d-flex flex-column flex-grow-1 justify-space-between">
        <!-- Message List -->
        <div 
          ref="messageList" 
          style="min-height: 0; overflow: hidden scroll;"
          class="flex-grow-1 flex-shrink-1"
        >
          <v-card dense flat v-for="mesg in messages" class="mb-1 pa-1" :key="mesg.timestamp">
            {{mesg.from}} - {{mesg.body}}
          </v-card>
        </div>
        
        <!-- Message Field -->
        <form @submit.prevent="sendMessage">
          <v-text-field outlined dense single-line hide-details append-icon="mdi-send" v-model="message"/>
        </form>
      </v-container>

      <!-- Search Results -->
      <div 
        @click="resultsActive = false; searchText = '';" 
        style="position: fixed; left: 0px; top: 0px; width: 100vw; height: 100vh; z-index: 10;" 
        v-if="resultsActive"
      />
      <v-card tile flat
        class="grey-100" 
        :class="[this.resultsActive ? 'searchmenu-shown' : 'searchmenu-hidden']" 
        style="z-index: 10; overflow: hidden scroll; min-width: 0; transition: 0.4s;">
      </v-card>
    </div>

  </div>
</template>

<style lang="scss">
.searchmenu {
  &-shown {
    width: 350px !important;
    min-width: 350px !important;
  }
  &-hidden {
    width: 0px !important;
  }
}
.searchbar {
  min-width: 300px !important;
  width: 300px !important; 
  max-width: 300px !important;
}
</style>

<script>
import { mapMutations } from 'vuex';
import { Store } from "@/store";
import { MessageStore } from '@/store/messages';
import messageDb from '@/assets/messageDb.js';
import * as msgpack from "@msgpack/msgpack";
const lz4 = require("lz4js");

export default {
  data () {
    return {
      message: "",
      resultsActive: false,
      searchText: "",
      loadedMessages: [],
      entity: this.$route.params.entity,
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
      let curblock = this.$store.state[MessageStore.namespace][MessageStore.$states.messages][this.entity];
      return this.loadedMessages.concat(curblock).filter(x => !!x);
    },
    currentItem() {
      if (!this.$store.state[Store.$states.roster] || !this.$store.state[Store.$states.avatars]) return {};
      if (!this.$store.state[Store.$states.roster]?.items) return {};
      return this.$store.state[Store.$states.roster].items.find(x => x.jid == this.entity);
    }
  },
  methods: {
    sendMessage () {
      if (!this.message.length) return;
      this.$stanza.client.sendMessage({
        type: "chat", 
        to: this.$route.params.entity, 
        body: this.message
      });
      this.message = "";
    },
    ...mapMutations({ setActiveChat: Store.$mutations.setActiveChat })
  },
  async mounted () {
    this.setActiveChat({type: 'chat', entity: this.$route.params.entity});
    // get blocks from archive in correct order
    let blocks = await messageDb.messageArchive
      .where("with").equals(this.entity)
      .reverse().limit(10).sortBy("timestamp");
    blocks.reverse();
    // combine messages and sort to ascending order
    this.loadedMessages = blocks.reduce((acc, {block}) => 
      acc.concat(msgpack.decode(lz4.decompress(block))), []
    );
  }
}
</script>
