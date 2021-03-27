<template>
  <div class="d-flex flex-column grey-200">
    <!-- Header -->
    <header-bar class="flex-shrink-0 d-flex px-4 align-center">
      <user-card :item="currentItem" selected class="user-card overflow-hidden"/>
      <v-spacer/>
      <div class="py-2">
        <v-text-field
          @focus="openSearch" @click="openSearch"
          @keydown.esc="closeSearch" @keydown.enter="search"
          :class="{unselectable: !this.searchActive}"
          v-model="searchText"
          single-line dense solo clearable hide-details flat
          background-color="grey-100"
          label="Search" class="searchbar"
          ref="searchBar"
        />
      </div>
    </header-bar>

    <!-- Main Section -->
    <main class="d-flex flex-row flex-grow-1 hide-overflow" ref="main">
      <div class="d-flex flex-column flex-grow-1 os-host-flexbox">
        <!-- Message List -->
        <overlay-scrollbars
          ref="messageList"
          class="flex-grow-1 flex-shrink-1 wide-scrollbar"
          :options="{scrollbars:{clickScrolling: true}}">
          <div class="scroller pt-4 justify-end d-flex flex-column">
            <message-group
              v-for="(group, i) in messageGroups(messages)"
              :key="group[0].timestamp"
              :group="group"/>
          </div>
        </overlay-scrollbars>

        <!-- Message Field -->
        <div>
          <chat-message-form 
            @changed="messageChanged" 
            @message="sendMessage" 
            :label="`Message ${bare}`">
            <p v-if="isTyping" class="d-flex flex-row align-center">
              <typing-spinner class="normal"/><span>{{this.bare}} is typing...</span>
            </p>
          </chat-message-form>
        </div>
      </div>

      <search-results
          v-if="searchActive"
          @jump-to="jump"
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

const kLoadCount = 6;

export default {
  key: 'chat',
  components: { MessageGroup, ChatMessageForm, SearchResults, Message, HeadingMessage, BodyMessage },
  data () {
    return {
      message: "",
      loadedMessages: [],
      searchActive: false,
      searchText: "",
      matches: [],

      composingTimeout: null,

      moreBefore: false,
      moreAfter: false,
      showBefore: true,
      showAfter: false,
      firstBlockStamp: 0,
      lastBlockStamp: 0,
      height: 0,
      loadedBlocks: [],
      preloadedBlocks: {},

      searchResultsClickOutside: {
        handler: this.closeSearch,
        closeConditional: this.searchActive,
        include: () => [this.$refs.searchBar.$el]
      },
    };
  },

  computed: {
    bare() { return this.$stanza.toBare(this.$route.params.entity); },

    messages () {
      this.$nextTick(() => {
        let list = this.$refs.messageList;
        let inst = list.osInstance();
        let state = inst.getState();
        if (!this.showAfter && state.overflowAmount.y - inst.scroll().position.y == 0) {
          // list.osInstance().scroll({ y: '100%' }, 0.0);
        }
      });

      let curblock = this.$store.state[MessageStore.namespace][MessageStore.$states.messages][this.bare] || [];
      return this.loadedBlocks
        .flat(1)
        .concat(!this.moreAfter ? curblock : [])
        .filter(x => !!x)
        // .sort((a, b) => a.timestamp - b.timestamp);
    },
    currentItem () {
      if (!this.$store.state[Store.$states.roster] || !this.$store.state[Store.$states.avatars]) return {};
      if (!this.$store.state[Store.$states.roster]?.items) return {};
      return this.$store.state[Store.$states.roster].items.find(x => x.jid === this.bare);
    },

    isTyping () {
      return this.$store.state[MessageStore.namespace][MessageStore.$states.chatComposing][this.bare];
    },
  },

  methods: {
    /** MESSAGES **/
    sendMessage (message) {
      this.$stanza.client.sendMessage({
        type: "chat",
        to: this.bare,
        body: message,
      });
    },

    messageChanged () {
      if (this.composingTimeout) clearTimeout(this.composingTimeout);
      this.$stanza.client.sendMessage({
        type: "chat",
        to: this.bare,
        chatState: "composing",
      });
      this.composingTimeout = setTimeout(() => {
        this.$stanza.client.sendMessage({
          type: "chat",
          to: this.bare,
          chatState: "active",
        });
      }, 2000);
    },

    messageGroups (messages) {
      if (!messages.length) return [];
      let groups = [[messages[0]]];
      for (let i = 1; i < messages.length; ++i) {
        let lastgroup = groups[groups.length - 1];
        if (lastgroup[0].from !== messages[i].from || lastgroup.length >= 10 || lastgroup[0].blockid !== messages[i].blockid) {
          groups.push([messages[i]]);
        } else {
          lastgroup.push(messages[i]);
        }
      }
      return groups;
    },

    /** SEARCH **/
    async parallelDecode(blocks) {
      return await Promise.all(blocks.map(block => new Promise(resolve =>
        resolve({ ...block, block: msgpack.decode(lz4.decompress(block.block)) })
      )));
    },

    async search () {
      let blocks = await Promise.all([
        messageDb.messages
          .where("with")
          .equals(this.bare)
          .toArray()
          .then(x => [x.sort((a, b) => a.timestamp - b.timestamp)]),
        search(this.searchText)
          .then(async eblocks => 
            (await this.parallelDecode(eblocks))
            .filter(block => block.with == this.bare)
            .map(x => x.block)
        ),
      ]).then(x => x.flat(1).filter(x => x.length));
      
      let matches = [];
      for (let block of blocks) {
        for (let msg of searchBlock(block, this.searchText)) {
          matches.push(msg);
        }
      }
      this.matches = matches
        .sort(([, as], [, bs]) => bs - as)
        .map(([msg]) => msg)
        .slice(0, 40);      
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

    async hasBlocksAfter (timestamp) {
      return await messageDb.messageArchive.where("timestamp").above(timestamp).count();
    },

    async hasBlocksBefore (timestamp) {
      return !!await messageDb.messageArchive.where("timestamp").below(timestamp).count();
    },

    async fetchBefore (timestamp, num = kLoadCount) {
      let entity = this.bare;
      let blocks = await messageDb.messageArchive
        .orderBy("timestamp")
        .reverse()
        .filter(x => x.with == entity && x.timestamp <= timestamp)
        .limit(num)
        .toArray();
      blocks.reverse();
      blocks = blocks.map(({ id, block }) => {
        this.preloadedBlocks[id] ||= msgpack.decode(lz4.decompress(block)).map(x => {
          x.blockid = id;
          return x;
        });
        return this.preloadedBlocks[id];
      });
      this.loadedBlocks = blocks.concat(this.loadedBlocks.slice(0, this.loadedBlocks.length - num));
  
      await this.updateBeforeAfter();
    },

    async fetchAfter (timestamp, num = kLoadCount) {
      let entity = this.bare;
      let blocks = await messageDb.messageArchive
        .orderBy("timestamp")
        .filter(x => x.with == entity && x.timestamp > timestamp)
        .limit(num)
        .toArray();
      blocks = blocks.map(({ id, block }) => {
        this.preloadedBlocks[id] ||= msgpack.decode(lz4.decompress(block)).map(x => {
          x.blockid = id;
          return x;
        });
        return this.preloadedBlocks[id];
      });
      this.loadedBlocks = this.loadedBlocks.slice(num - 1).concat(blocks);

      await this.updateBeforeAfter();
    },

    async updateBeforeAfter () {
      let lastBlock = this.loadedBlocks[this.loadedBlocks.length - 1];
      this.firstBlockStamp = this.loadedBlocks[0][0].timestamp;
      this.lastBlockStamp = lastBlock[lastBlock.length - 1].timestamp;
      this.moreBefore = await this.hasBlocksBefore(this.firstBlockStamp - 1);
      this.moreAfter = await this.hasBlocksAfter(this.lastBlockStamp + 1);
    },

    async fetchMessages (center) {
      let entity = this.bare;
      // ensure some blocks are loaded
      if (await messageDb.messageArchive.where("with").equals(entity).count() < 4) {
        await this.$store.dispatch(`${MessageStore.namespace}/${MessageStore.$actions.syncMessages}`, entity);
      }
      await this.$store.dispatch(`${MessageStore.namespace}/${MessageStore.$actions.loadCurrentMessages}`, entity);
      this.$store.dispatch(`${MessageStore.namespace}/${MessageStore.$actions.syncMessages}`, entity);

      await this.fetchBefore(center);
    },

    async jump (timestamp) {
      this.loadedMessages = [];
      await this.fetchMessages(timestamp);
      this.updateScrollPast();
      document.getElementById("msg:" + timestamp)?.nextElementSibling.classList.add("highlight");
      setTimeout(() => {
        document.getElementById("msg:" + timestamp)?.nextElementSibling.classList.remove("highlight");
      }, 1000);
      let scrollpos = document.getElementById("msg:" + timestamp).parentElement.offsetTop;
      this.$refs.messageList.osInstance().scroll({ y: `${scrollpos}px` }, 0.0);
    },

    updateScrollPast () {
      this.showBefore = this.moreBefore;
      this.showAfter = this.moreAfter;
    },

    ...mapMutations({ setActiveChat: Store.$mutations.setActiveChat })
  },

  watch: {
    async $route (value) {
      this.loadedBlocks = [];
      this.$nextTick(async () => {
        await this.fetchMessages(Date.now());
        this.updateScrollPast();
        this.$nextTick(() => this.$refs.messageList.osInstance().scroll({ y: '100%' }, 0.0));
        this.setActiveChat({type: 'chat', entity: this.bare});
      });
    }
  },

  async mounted () {
    await this.fetchMessages(Date.now());
    this.updateScrollPast();
    this.setActiveChat({type: 'chat', entity: this.bare});
    this.$nextTick(async () => {
      let messageList = this.$refs.messageList;

      messageList.osInstance().scroll({ y: '100%' }, 0.0);

      messageList.osInstance().options("callbacks.onScrollStop", async () => {
        let inst = messageList.osInstance();
        
        let keyBefore = "msg:" + this.firstBlockStamp;
        let posBefore = document.getElementById(keyBefore)?.getBoundingClientRect().top;
        let keyAfter = "msg:" + this.lastBlockStamp;
        let posAfter = document.getElementById(keyAfter)?.getBoundingClientRect().top;
        let curScroll = inst.scroll().position.y;

        if (this.showBefore && inst.scroll().position.y < 400) {
          inst.sleep();
          await this.fetchBefore(this.firstBlockStamp - 1, 1);

          this.$nextTick(() => {
            
            let pos = document.getElementById(keyBefore).getBoundingClientRect().top;
            inst.scroll({ y: `${curScroll + pos - posBefore}px` });
            inst.update();
            this.updateScrollPast();
          });
        }

        if (
          this.showAfter && inst.scroll().position.y + 400 > inst.getState().overflowAmount.y
        ) {
          inst.sleep();
          await this.fetchAfter(this.lastBlockStamp, 1);
          this.$nextTick(() => {
            let pos = document.getElementById(keyAfter)?.getBoundingClientRect().top;
            inst.scroll({ y: `${curScroll + pos - posAfter}px` });
            inst.update();
            this.updateScrollPast();
          });
        }
      });
      
    });
  }
}
</script>