<template>
  <div class="d-flex flex-column grey-200">
    <!-- Header -->
    <header-bar class="flex-shrink-0" :mobile="$device.isMobileOrTablet" menu>
      <user-card :jid="bare" selected class="user-card overflow-hidden"/>
      <v-spacer/>
      <div class="py-2">
        <v-text-field
          v-if="!$device.isMobileOrTablet"
          @focus="openSearch" @click="openSearch"
          @keydown.esc="closeSearch" @keydown="searchUpdate"
          v-model="searchText"
          single-line dense solo clearable hide-details flat
          background-color="grey-100"
          label="Search" class="searchbar"
          ref="searchBar"/>

        <template v-else>
          <v-btn icon class="mx-2" ref="searchBar" @click="$refs.mobileDialog.open()">
            <v-icon size="1.66em" color="white">mdi-dots-vertical</v-icon>
          </v-btn>

          <bottom-sheet :items="bottomSheetItems" ref="mobileDialog"/>
        </template>
      </div>
    </header-bar>

    <!-- Main Section -->
    <main class="d-flex flex-row flex-grow-1 hide-overflow">
      <div class="d-flex flex-column flex-grow-1">
        <!-- Message List -->
        <simplebar
          class="simplebar simplebar-no-gutter wide-scrollbar flex-grow-1"
          data-simplebar-auto-hide="false"
          data-simplebar-force-visible="true"
          ref="messageList">
          <div class="pt-4 mr-4 scroller">
            <message-group
              v-for="(group, i) in messageGroups(messages)"
              :key="i"
              :group="group"/>
          </div>
        </simplebar>

        <!-- Message Field -->
        <div>
          <chat-message-form
            @composing="composing" @paused="paused"
            @message="sendMessage"
            :label="`Message ${bare}`">
            <template v-if="isTyping">
              <typing-spinner class="normal ml-n2"/>
              <b class="grey-800--text">{{localPart(bare)}} is typing...</b>
            </template>
          </chat-message-form>
        </div>
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
import { mapMutations, mapState } from 'vuex';
import { Store } from "@/store";
import { MessageStore } from '@/store/messages';
import SimpleBar from "simplebar";
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
import {SettingsStore} from "@/store/settings";

const lz4 = require("lz4js");

export default {
  key: 'chat',
  components: { MessageGroup, ChatMessageForm, SearchResults, Message, HeadingMessage, BodyMessage },
  data () {
    return {
      message: "",
      loadedMessages: [],

      searchActive: false,
      searchText: "",
      searchTimeout: null,
      matches: [],

      bottomSheetItems: [
        {icon: 'mdi-magnify', title: 'Search'},
        {icon: 'mdi-file-document', title: 'Send Over A Large File'},
        {icon: 'mdi-account-cancel', title: 'Block Friend'},
        {icon: 'mdi-account-minus', title: 'Remove Friend', color: 'red'}
      ],
    };
  },

  computed: {
    ...mapState(MessageStore.namespace, {
      chatComposing: MessageStore.$states.chatComposing,
    }),

    ...mapState(SettingsStore.namespace, {
      activeChatReceipts: SettingsStore.$states.activeChatReceipts,
      messageReadReceipts: SettingsStore.$states.messageReadReceipts,
      sendTypingReceipts: SettingsStore.$states.sendTypingReceipts,
    }),

    ...mapState({
      roster: Store.$states.roster,
      avatars: Store.$states.avatars,
    }),

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
      return this.loadedMessages.concat(curblock).filter(x => !!x).sort((a, b) => a.timestamp - b.timestamp);
    },

    isTyping () {
      return this.chatComposing[this.bare];
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

    composing() {
      if(this.sendTypingReceipts)
        this.$stanza.client.sendMessage({
          type: "chat",
          to: this.bare,
          chatState: "composing",
        });
    },

    paused() {
      if(this.sendTypingReceipts)
        this.$stanza.client.sendMessage({
          type: "chat",
          to: this.bare,
          chatState: "paused",
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
      ]).then(x => x.flat(1).filter(x => x.length));

      let matches = [];
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

    async fetchMessages () {
      let entity = this.$route.params.entity;
      // ensure some blocks are loaded
      if (await messageDb.messageArchive.where("with").equals(entity).count() < 4) {
        await this.$store.dispatch(`${MessageStore.namespace}/${MessageStore.$actions.syncMessages}`, entity);
      }
      await this.$store.dispatch(`${MessageStore.namespace}/${MessageStore.$actions.loadCurrentMessages}`, entity);
      this.$store.dispatch(`${MessageStore.namespace}/${MessageStore.$actions.syncMessages}`, entity);
      // get blocks from archive in correct order
      let blocks = (await messageDb.messageArchive
        .orderBy("timestamp").reverse()
        .filter(x => x.with == entity)
        .toArray()).slice(0, 10);
      blocks.reverse();
      // combine messages
      this.loadedMessages = blocks.reduce((acc, {block}) =>
          acc.concat(msgpack.decode(lz4.decompress(block))), []
      );
    },

    init () {
      const { scrollElement } = this.$refs.messageList;
      scrollElement.scroll(0, scrollElement.scrollHeight);

      scrollElement.onscroll = ({ target }) => {
      };
    },

    ...mapMutations({ setActiveChat: Store.$mutations.setActiveChat })
  },

  watch: {
    async $route(value) {
      this.setActiveChat({type: 'chat', entity: value.params.entity});
      await this.fetchMessages();
      this.init();
    }
  },

  async mounted () {
    await this.fetchMessages();
    this.init();
  }
}
</script>
