<template>
  <div class="d-flex">

    <!-- Indicator light gutter -->
    <span class="gutter indicator-light border-circle-right flex-shrink-0" :class="selected ? 'grey-800' : ''"/>

    <!-- Roster item card  -->
    <div class="flex-grow-1 hide-overflow d-flex rounded main" :aria-selected="selected" >
        <!-- Wrap everything except vertical ... into a NuxtLink -->
        <nuxt-link :to="`/chat/${item.jid}`" class="reset-link flex-grow-1 d-flex hide-overflow">

          <!-- Vertical align Avatar -->
          <div class="align-content-center-inline ml-2" style="width: 36px">
            <badged-avatar :size="36" :jid="item.jid" :color="onlineStatus">
              <typing-spinner class="small" :color="onlineStatus" v-if="isTyping"/>
            </badged-avatar>
          </div>

          <div class="main-container ml-2 pr-2 flex-grow-1 my-auto hide-overflow">
            <!-- Online status icon, username@domain -->
            <span>
              <span :class="selected ? '' : 'grey-700--text'">
                {{name}}
              </span>

              <span style="margin-left: -2px; margin-right: -2px;">
                <v-icon class="no-transition" :color="selected ? 'white' : 'grey-400'" size="1em">mdi-at</v-icon>
              </span><span :class="selected ? '' : 'grey-400--text'">
                {{domain}}
              </span>
            </span>

            <br>

            <!-- Status message under that -->
            <span class="grey-700--text" style="font-size: 12px;">{{statusMessage}}</span>
          </div>
        </nuxt-link>

        <div class="my-auto mr-2 options-slot">
          <slot>

              <div class="options-container">
                <slot name="options"/>
              </div>

          </slot>
        </div>

    </div>

    <!-- Empty right-side gutter -->
    <span class="gutter flex-shrink-0"/>
  </div>
</template>

<script>
  import { JID } from '@bonfire-xmpp/verse';

  import { Store } from "@/store";
  import { MessageStore } from '@/store/messages';

  import { mapGetters, mapState } from 'vuex';
  import Avatar from "@/components/Avatar";

  export default {
    name: "RosterItem",
    components: { Avatar },
    props: {
      item: {
        type: Object,
        required: true,
      },
      selected: {
        type: Boolean,
        required: false,
        default: false,
      },
    },

    computed: {
      ...mapGetters({
        getPresence: Store.$getters.presence,
      }),

      name() { return this.$stanza.getLocal(this.item.jid); },
      domain() { return this.$stanza.getDomain(this.item.jid); },
      presence() { return this.getPresence(this.item.jid); },

      available() { return this.presence?.available; },
      statusMessage() { return this.presence?.status; },

      onlineStatus() {
        if(!this.available) return 'offline';
        if(!this.presence?.show && this.available) return 'online';
        return this.presence?.show;
      },

      ...mapState(MessageStore.namespace, {
        chatComposing: MessageStore.$states.chatComposing
      }),

      isTyping () {
        return this.chatComposing[JID.toBare(this.item.jid)];
      },
    },
  }
</script>

<style scoped lang="scss">
  // Constant height
  .main {
    @include ensure-height(42px);
  }

  // Hide options when the .main container _isn't_ hovered
  .main:not(:hover) .options-container {
    display: none;
  }

  // Hover and selected background colors
  // NOTE: order of :hover and [aria-selected] matters, as they have the same specificity
  .main {
    @include v-badge-border-color(map-get($greys, "100"));

    &:hover {
      background: map-get($greys, "200");
      @include v-badge-border-color(map-get($greys, "200"));
    }

    &[aria-selected] {
      background: map-get($greys, "300");
      @include v-badge-border-color(map-get($greys, "300"));
    }
  }

  // 8px total = right padding on the card
  .gutter {
    width: 3px;
    margin-right: 5px;
  }

  .indicator-light {
    margin-top: auto;
    margin-bottom: auto;

    height: 16px;
  }

  // Vuetify sets line-height to 1.5/24px, so we reset it here
  .main-container {
    line-height: 1;
  }
</style>
