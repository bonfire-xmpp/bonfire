<template>
  <div class="d-flex flex-nowrap flex-column flex-grow-1">

    <!-- Header -->
    <v-container fluid style="height: 64px; z-index: 4;" class="no-select grey-100 d-flex flex-row align-center">
      <!-- <h2 class="align-self-center">{{this.$route.params.entity}}</h2> -->
      <roster-item :item="currentItem"/>
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
          <v-card dense flat v-for="mesg in messages" class="mb-1 pa-1" :key="mesg.id">
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
import { mapState, mapMutations } from 'vuex';
import { Store } from "@/store";
import { MessageStore } from '@/store/messages';

export default {
  data () {
    return {
      message: "",
      resultsActive: false,
      searchText: ""
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
    },
    currentItem() {
      return this.$store.state[Store.$states.roster].items.find(x => x.jid == this.$route.params.entity);
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
  mounted() {
    this.setActiveChat({type: 'chat', entity: this.$route.params.entity});
  }
}
</script>
