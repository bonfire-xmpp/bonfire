<template>
  <v-img :width="size" :height="size" :src="url" class="rounded-circle"/>
</template>

<script>
  export default {
    name: "Avatar",

    data() {
      return {
        url: "",
      }
    },

    props: {
      size: Number,
      jid: String,
    },

    async mounted() {
      const avatarDataPubsubItem = await this.$stanza.client.getAvatar(this.jid);

      const blob = new Blob([avatarDataPubsubItem.content.data], {'type': 'image/png'});
      this.url = URL.createObjectURL(blob);
    }
  }
</script>
