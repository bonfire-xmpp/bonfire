<template>
  <v-dialog class="rounded-xl" :value="value" persistent width="500" :fullscreen="$device.isMobileOrTablet"
            v-if="!accepted">
    <v-card outlined class="text-white rounded-lg unselectable d-flex flex-col">

      <v-card-title class="text-center font-weight-black d-block bg-black-lighten">
        <span>Hold up!</span>
        <v-btn icon class="float-right mt-n1" @click.stop="decline">
          <icon color="grey-600">mdi-close</icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="flex-grow bg-black-lighten" style="font-size: 1em;">
        <div class="text-center font-weight-black">
          Friends in XMPP don't work like you might expect!
        </div>

        <v-divider class="my-3"/>

        <div>
          When you accept somebody's friend request, <strong>you're letting them see your status.</strong>
          We will automatically send a request back, but they don't have to accept it.
        </div>

        <v-divider class="my-3"/>

        <p>
          People whose status <i>you</i> can see, but they can't see yours, are labeled <strong>Acquaintances.</strong>
        </p>

        <p>
          People who can see <i>your</i> status, but you can't see theirs, are labeled <strong>Observers.</strong>
        </p>

        <div>
          If someone isn't labeled either, then you can both see each other's status.
        </div>

        <v-spacer/>
        <div class="mb-n4 mt-4 text-right text-caption text--disabled">
          We won't bother you again after you accept.
        </div>
      </v-card-text>

      <v-divider/>
      <v-card-actions class="pb-3 flex-row-reverse bg-black action-buttons">
        <v-btn :ripple="false" @click="accept" small depressed color="primary">I understand</v-btn>
        <v-btn :ripple="false" @click="decline" small depressed color="black">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {mapMutations, mapState} from "vuex";
import Store from "@/store";

export default {
  name: 'AddFriendModal',
  props: {
    value: Boolean,
  },
  data() {
    return {
      resolve: null,
      promise: null,
    }
  },
  computed: {
    ...mapState({
      accepted: Store.$states.rosterAcceptPrivacyRead,
    })
  },
  methods: {
    ...mapMutations({
      setAccepted: 'SET_' + Store.$states.rosterAcceptPrivacyRead,
    }),

    accept() {
      this.setAccepted(true);
      this.resolve(true);

      // Close the dialog
      this.$emit('input', false);
    },

    decline() {
      this.setAccepted(false);
      this.resolve(false);

      // Close the dialog
      this.$emit('input', false);
    },

    getResponse() {
      if(this.accepted) return new Promise(resolve => resolve(true));
      this.promise = new Promise(resolve => this.resolve = resolve);
      return this.promise;
    },
  },
}
</script>

<style scoped lang="scss">
.field-desc {
  &::before {
    content: "";
    width: 4px;
    display: inline-block;
  }
}

.action-buttons > * {
  margin-left: 12px;
}
</style>
