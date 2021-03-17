<template>
  <div class="d-flex flex-nowrap flex-column flex-grow-1">
    <!-- Header -->
    <header-bar class="d-flex grey-200 px-4 align-center">
      <user-card :item="currentItem" selected/>
      <v-spacer/>
      <div class="py-2">
        <v-text-field
          @focus="openSearch" @click="openSearch"
          @keydown.esc="closeSearch" @keydown="searchUpdate"
          v-model="searchText"
          single-line dense solo clearable hide-details flat
          background-color="grey-100"
          label="Search" class="searchbar"
        />
      </div>
    </header-bar>

    <!-- Main Section -->
    <div class="d-flex flex-nowrap flex-row flex-grow-1 hide-overflow grey-200">
      <div class="d-flex flex-column flex-grow-1 justify-space-between">
        <!-- Message List -->
        <div
          ref="messageList"
          style="min-height: 0; overflow: hidden scroll !important;"
          class="flex-grow-1 flex-shrink-1 pt-4"
        >
          <message-group
            v-for="group in messageGroups(messages)"
            :key="'group:' + group[0].timestamp"
            :group="group"/>
        </div>

        <!-- Message Field -->
        <form @submit.prevent="sendMessage">
          <v-text-field outlined dense single-line hide-details append-icon="mdi-send" v-model="message"/>
        </form>
      </div>

      <!-- Search Results -->
      <div
        @click="closeSearch"
        style="position: fixed; left: 0px; top: 0px; width: 100vw; height: 100vh; z-index: 10;"
        v-if="searchActive"
      />
      <div tile flat
        class="d-flex flex-row align-start justify-center grey-100 searchmenu"
        :class="[this.searchActive ? 'searchmenu-shown' : 'searchmenu-hidden']"
        style="z-index: 10; transition: 0.2s; overflow: hidden scroll;"
      >
        <div style="width: 100%;" class="d-flex flex-column">
          <div v-for="match in matches" :key="match.id" class="mb-4">
            <p class="ma-0 px-2">{{formatTime(new Date(match.timestamp))}}</p>
            <p class="ma-0 px-2 flex-shrink-1" style="white-space: normal;">
              <b>{{localPart(match.from)}}</b> - {{match.body}}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
$width: 400px;
.searchmenu {
  width: $width !important;
  min-width: $width !important;
  max-width: $width !important;
  &-shown {
    margin-right: 0px;
  }
  &-hidden {
    margin-right: -$width;
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
import { search, searchBlock } from "@/store/search";
import MessageGroup from "@/components/Messages/MessageGroup";
import * as XMPP from "stanza";
import messageDb from '@/assets/messageDb.js';
import * as msgpack from "@msgpack/msgpack";
const lz4 = require("lz4js");

export default {
  components: { MessageGroup },
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
    currentItem () {
      if (!this.$store.state[Store.$states.roster] || !this.$store.state[Store.$states.avatars]) return {};
      if (!this.$store.state[Store.$states.roster]?.items) return {};
      return this.$store.state[Store.$states.roster].items.find(x => x.jid == this.entity);
    }
  },
  methods: {
    /** MESSAGES **/
    sendMessage () {
      if (!this.message.length) return;
      this.$stanza.client.sendMessage({
        type: "chat",
        to: this.$route.params.entity,
        body: this.message,
      });
      this.message = "";
    },
    formatTime (date) {
      let hours = date.getHours();
      let ampm = "AM";
      if (hours > 12) {
        ampm = "PM";
        hours -= 12;
      }
      return `${hours}:${date.getMinutes().toString().padStart(2, "0")} ${ampm}`;
    },
    messageGroups (messages) {
      if (!messages.length) return [];
      let groups = [[messages[0]]];
      for (let i = 1; i < messages.length; ++i) {
        let lastgroup = groups[groups.length - 1];
        if (lastgroup[0].from != messages[i].from || lastgroup.length >= 10) {
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
