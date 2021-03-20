<template>
  <div class="d-flex flex-column grey-200">
    <!-- Header -->
    <header-bar class="flex-shrink-0 d-flex px-4 align-center">
      <user-card :item="currentItem" selected class="user-card overflow-hidden"/>
      <v-spacer/>
      <div class="py-2">
        <v-text-field
          @focus="openSearch" @click="openSearch"
          @keydown.esc="closeSearch" @keydown="searchUpdate"
          v-model="searchText"
          single-line dense solo clearable hide-details flat
          background-color="grey-100"
          label="Search" class="searchbar"
          ref="searchBar"
        />
      </div>
    </header-bar>

    <!-- Main Section -->
    <main class="d-flex flex-row flex-grow-1 hide-overflow">
      <div class="d-flex flex-column flex-grow-1 os-host-flexbox">
        <!-- Message List -->
        <overlay-scrollbars
          ref="messageList"
          class="flex-grow-1 flex-shrink-1 wide-scrollbar"
          :options="{scrollbars:{clickScrolling: true}}">
          <div class="pt-4 scroller">
            <message-group
              v-for="(group, i) in messageGroups(messages)"
              :key="i"
              :group="group"/>
          </div>
        </overlay-scrollbars>

        <!-- Message Field -->
        <chat-message-form @message="sendMessage" :label="`Message ${bare}`"/>
      </div>

      <search-results
          :hidden="searchActive"
          :results="matches"
          v-click-outside="searchResultsClickOutside"/>

    </main>
  </div>
</template>

<style lang="scss" scoped>
  .searchbar {
    @include ensure-width(300px)
  }

  .user-card {
    @include v-badge-border-color(map-get($greys, "200"));
    white-space: nowrap;
  }

  .scroller > *:last-child {
    padding-bottom: 1rem !important;
  }
</style>

<script>
import { mapMutations } from 'vuex';
import { Store } from "@/store";
import { MessageStore } from '@/store/messages';
import { search, searchBlock } from "@/store/search";

import MessageGroup from "@/components/Chat/MessageGroup";
import ChatMessageForm from "@/components/Chat/ChatMessageForm";
import SearchResults from "@/components/Chat/SearchResults";
import Message from "@/components/Chat/Message";
import HeadingMessage from "@/components/Chat/Message/HeadingMessage";
import BodyMessage from "@/components/Chat/Message/BodyMessage";

import * as XMPP from "stanza";

import messageDb from '@/assets/messageDb.js';
import * as msgpack from "@msgpack/msgpack";
const lz4 = require("lz4js");

export default {
  key: 'chat',
  components: { MessageGroup, ChatMessageForm, SearchResults, Message, HeadingMessage, BodyMessage },
  data () {
    return {
      message: "",
      loadedMessages: [],
      entity: this.$route.params.entity,

      searchActive: false,
      searchText: "",
      searchTimeout: null,
      matches: [],
    };
  },

  computed: {
    searchResultsClickOutside() {
      return {
        handler: this.closeSearch,
        closeConditional: this.searchActive,
        include: () => [this.$refs.searchBar.$el]
      };
    },

    bare() { return this.$stanza.toBare(this.$route.params.entity); },

    messages () {
      let curblock = this.$store.state[MessageStore.namespace][MessageStore.$states.messages][this.entity];
      return this.loadedMessages.concat(curblock).filter(x => !!x);
    },
    currentItem () {
      if (!this.$store.state[Store.$states.roster] || !this.$store.state[Store.$states.avatars]) return {};
      if (!this.$store.state[Store.$states.roster]?.items) return {};
      return this.$store.state[Store.$states.roster].items.find(x => x.jid === this.entity);
    },
  },

  methods: {
    sendMessage(message) {
      this.$stanza.client.sendMessage({
        type: "chat",
        to: this.$route.params.entity,
        body: message,
      });
    },

    messageGroups (messages) {
      if (!messages.length) return [];
      let groups = [[messages[0]]];
      for (let i = 1; i < messages.length; ++i) {
        let lastgroup = groups[groups.length - 1];
        if (lastgroup[0].from !== messages[i].from || lastgroup.length >= 10) {
          groups.push([messages[i]]);
        } else {
          lastgroup.push(messages[i]);
        }
      }
      return groups;
    },

    /** SEARCH **/
    async searchUpdate () {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
        if (!this.searchText.length) return;
      }
      this.searchTimeout = setTimeout(this.search, 100);
    },
    async search () {
      let matches = [];
      let blocks = await Promise.all([
        messageDb.messages
          .where("with")
          .equals(this.entity)
          .toArray()
          .then(x => [x.sort((a, b) => a.timestamp - b.timestamp)]),
        search(this.searchText)
          .then(eblocks => eblocks.map(eblock =>
            msgpack.decode(lz4.decompress(eblock.block))
          )),
      ]).then(x => x.flat(1));
      for (let block of blocks) {
        for (let msg of searchBlock(block, this.searchText)) {
          matches.push(msg);
        }
      }
      this.matches = matches;
    },

    openSearch () {
      if(this.searchActive) return;

      this.matches = [];
      this.searchActive = true;
    },
    closeSearch () {
      this.matches = [];
      this.searchActive = false;
      this.searchText = "";
    },

    /** STANZA **/
    localPart (jid) {
      return XMPP.JID.getLocal(jid);
    },

    ...mapMutations({ setActiveChat: Store.$mutations.setActiveChat })
  },

  watch: {
    async $route(value) {
      this.setActiveChat({type: 'chat', entity: value.params.entity});
      // get blocks from archive in correct order
      let blocks = await messageDb.messageArchive
          .where("with").equals(this.entity)
          .reverse().limit(1).sortBy("timestamp");
      blocks.reverse();
      // combine messages
      this.loadedMessages = blocks.reduce((acc, {block}) =>
          acc.concat(msgpack.decode(lz4.decompress(block))), []
      );
    }
  },

  async mounted () {
    this.setActiveChat({ type: 'chat', entity: this.$route.params.entity });
    // get blocks from archive in correct order
    let blocks = await messageDb.messageArchive
        .where("with").equals(this.entity)
        .reverse().limit(10).sortBy("timestamp");
    blocks.reverse();
    // combine messages
    this.loadedMessages = blocks.reduce((acc, {block}) =>
        acc.concat(msgpack.decode(lz4.decompress(block))), []
    );
  }
}
</script>
