<template>
  <v-img v-if="avatar" :width="size" :height="size" :src="avatar" class="rounded-circle"/>
  <default-avatar :size="size" :color="color" v-else/>
</template>

<script>
  import { mapState, mapActions } from 'vuex';
  import { Store } from "@/store";

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
        return this.avatars[this.$stanza.toBare(this.jid)];
      },

      color() {
        return `hsl(${this.jid.charCodeAt(0) || 20 + this.jid.charCodeAt(7) || 92},` +
        `${Math.min(this.jid.charCodeAt(0) * this.jid.length, 60)}%,` +
        `${Math.min(this.jid.charCodeAt(1) * this.jid.length, 60)}%)`;
      },
    },

    async mounted() {
      this.getAvatar({jid: this.jid});
    }
  }
</script>
