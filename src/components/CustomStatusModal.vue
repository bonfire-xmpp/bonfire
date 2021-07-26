<template>
  <v-dialog class="rounded-xl" :value="value" @input="$emit('input', $event)" width="500" :fullscreen="$device.isMobileOrTablet">
    <v-card outlined class="text-white rounded-lg unselectable flex flex-col">

      <v-card-title class="text-center font-weight-black block bg-black-lighten">
        <span>Set custom status</span>
        <v-btn icon class="float-right mt-n1" @click.stop="$emit('input', false)">
          <icon color="grey-600">mdi-close</icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="flex-grow bg-black-lighten">
        <v-form @submit.prevent="setStatus">
          <div class="field-desc pb-1 font-weight-medium text-grey-600">Set your custom message</div>
          <v-text-field autofocus clearable outlined dense placeholder="Listening to music!" single-line v-model="status"/>
        </v-form>
      </v-card-text>

      <v-divider/>
      <v-card-actions class="pb-3 flex-row-reverse bg-black action-buttons">
        <v-btn :ripple="false" @click="setStatus" small depressed color="primary">Save</v-btn>
        <v-btn :ripple="false" @click="$emit('input', false)" small depressed color="black">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex';
import Store from "@/store";
import Icon from "@/components/Icon";

export default {
  name: 'CustomStatusModal',
  components: {Icon},
  props: {
    value: Boolean,
  },
  data() {
    return {
      status: ""
    }
  },
  computed: {
    ...mapState({
      currentStatus: Store.$states.statusMessage,
    }),

    computedStatus: {
      get() { return this.status || this.currentStatus; },
      set(val) { this.status = val; }
    }
  },
  methods: {
    setStatus() {
      this.$stanza.setStatusMessage(this.status);

      // Close the dialog
      this.$emit('input', false);
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

*::v-deep .v-text-field__details {
  max-height: 0 !important;
  min-height: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
}

.action-buttons > * {
  margin-left: 12px;
}
</style>
