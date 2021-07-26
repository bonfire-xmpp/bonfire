<template>
  <Image v-if="avatar" :alt="`${$stanza.getLocal(jid)}'s avatar`" :size="size" :src="avatar" class="rounded-full" eager @click="$emit('click', $event)"/>
  <default-avatar :size="size" :color="color" v-else @click="$emit('click', $event)"/>
</template>

<script>
  import { mapState, mapActions } from 'vuex';
  import Store from "@/store";

  import DefaultAvatar from "@/components/DefaultAvatar";
  import Image from "@/components/Image";

  export default {
    name: "Avatar",
    components: {DefaultAvatar, Image},

    props: {
      size: Number || String,
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
