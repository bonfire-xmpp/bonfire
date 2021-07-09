<template>
  <v-dialog class="rounded-xl" :value="value" @input="$emit('input', $event)" width="500" :fullscreen="$device.isMobileOrTablet">
    <v-card outlined class="white--text rounded-lg unselectable d-flex flex-column">

      <v-card-title class="text-center font-weight-black d-block black-lighten">
        <span>Add a friend</span>
        <v-btn icon class="float-right mt-n1" @click.stop="$emit('input', false)">
          <v-icon color="grey-600">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="flex-grow-1 black-lighten">
        <v-form @submit.prevent="addFriend" ref="form">
          <div class="field-desc pb-1 font-weight-medium grey-600--text">Enter a JID</div>
          <v-text-field autofocus required clearable outlined dense placeholder="friend@server.com" single-line v-model="jid" :rules="jidRules"/>
        </v-form>
      </v-card-text>

      <v-divider/>
      <v-card-actions class="pb-3 flex-row-reverse black action-buttons">
        <v-btn :ripple="false" @click="addFriend" small depressed color="primary">Add</v-btn>
        <v-btn :ripple="false" @click="$emit('input', false)" small depressed color="black">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'AddFriendModal',
  props: {
    value: Boolean,
  },
  data() {
    return {
      jid: "",
      jidRules: [
        jid => /.+@.+/.test(jid) || "Invalid JID"
      ],
    }
  },
  methods: {
    addFriend() {
      // Go through the motions only for valid inputs
      if(this.$refs.form.validate()) {
        // Add friend
        this.$stanza.roster.accept(this.jid);

        // Close the dialog
        this.$emit('input', false);
      }
    }
  },
  watch: {
    value(val) {
      // Reset validation errors when opened
      if(val) this.$nextTick(() => this.$refs.form.resetValidation());

      // Empty the input fields
      else this.$refs.form.reset()
    }
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

//*::v-deep .v-text-field__details {
//  max-height: 0 !important;
//  min-height: 0 !important;
//  padding: 0 !important;
//  margin: 0 !important;
//}

.action-buttons > * {
  margin-left: 12px;
}
</style>
