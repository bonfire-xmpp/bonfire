<template>
  <div class="d-flex">

    <!-- Indicator light gutter -->
    <span class="gutter indicator-light border-circle-right flex-shrink-0" :class="selected ? 'grey-800' : ''"/>

    <!-- Roster item card  -->
    <div class="flex-grow-1 hide-overflow d-flex rounded main" :aria-selected="selected">
        <!-- Wrap everything except vertical ... into a NuxtLink -->
        <nuxt-link :to="`/chat/${item.jid}`" class="reset-link flex-grow-1 d-flex hide-overflow">

          <!-- Vertical align Avatar -->
          <div class="align-content-center-inline ml-2">
            <avatar :size="36" :jid="item.jid"/>
          </div>

          <div class="main-container ml-2 pr-2 flex-grow-1 my-auto hide-overflow">
            <!-- Online status icon, username@domain -->
            <span>
              <v-icon :class="statusColor + '--text'" :size="10">mdi-circle</v-icon>
              <span :class="selected ? '' : 'grey-700--text'">{{name}}</span>
              <span :class="selected ? '' : 'grey-500--text'">@{{domain}}</span>
            </span>

            <br>

            <!-- Status message under that -->
            <span class="grey-700--text" style="font-size: 12px;">{{statusMessage}}</span>
          </div>
        </nuxt-link>

        <div class="options-container my-auto mr-2">
          <v-btn icon small color="white">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </div>
    </div>

    <!-- Empty right-side gutter -->
    <span class="gutter flex-shrink-0"/>
  </div>
</template>

<script>
  import { JID } from 'stanza';

  import { Store } from "@/store";
  import { mapGetters } from 'vuex';

  export default {
    name: "RosterItem",
    props: {
      item: {
        type: Object,
        required: true,
      },
      selected: {
        type: Boolean,
        required: false,
        default: false,
      }
    },

    computed: {
      ...mapGetters({
        getPresence: Store.$getters.presence,
      }),

      name() { return this.item.name; },
      domain() { return JID.getDomain(this.item.jid); },
      presence() { return this.getPresence(this.item.jid); },

      available() { return this.presence?.available; },
      statusMessage() { return this.presence?.status; },

      onlineStatus() { return this.presence?.show; },
      statusColor() {
        switch (this.onlineStatus) {
          case 'xa':
          case 'away':
              return 'warning';
          case 'dnd':
            return 'error';
        }

        if(!this.available) return 'grey';
        if(!this.onlineStatus && this.available) return 'success';
      }
    }
  }
</script>

<style scoped lang="scss">
  // Constant height
  .main {
    height: 42px;
    min-height: 42px;
    max-height: 42px;
  }

  // Hide options when the .main container _isn't_ hovered
  .main:not(:hover) > .options-container {
    display: none;
  }

  // Hover and selected background colors
  // NOTE: order of :hover and [aria-selected] matters, as they have the same specificity
  .main {
    &:hover {
      background: map-get($greys, "200");
    }

    &[aria-selected] {
      background: map-get($greys, "300");
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
