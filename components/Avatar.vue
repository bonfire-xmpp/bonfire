<template>
  <v-img :width="size" :height="size" :src="avatar" class="rounded-circle"/>
</template>

<script>
  import { mapState, mapActions } from 'vuex';
  import { Store } from "@/store";
  import { JID } from 'stanza';

  export default {
    name: "Avatar",

    props: {
      size: Number,
      jid: String,
    },

    methods: {
      ...mapActions({
        getAvatar: Store.$actions.getAvatar,
      }),
    },

    computed: {
      ...mapState({
        avatars: Store.$states.avatars,
      }),

      avatar() {
        return this.avatars[JID.toBare(this.jid)];
      },
    },

    async mounted() {
      this.getAvatar({jid: this.jid});
    }
  }
</script>
