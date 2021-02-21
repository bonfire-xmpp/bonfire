<template>
  <v-container fluid>
    <v-card class="message-group" v-for="group, i in messages" :key="i" flat dense tile>
      <v-card-title class="group-name">
        {{group[0].user}}
        <v-divider class="mx-2 message-divider" vertical></v-divider>
        {{formatDate(new Date(group[0].date))}}
      </v-card-title>
      <div v-for="mesg in group" :key="mesg" class="message d-flex">
        <div class="message-date">
          
        </div>
        <div class="message-body">
          {{mesg.body}}
        </div>
      </div>
    </v-card>
  </v-container>
</template>

<style lang="sass">
.message
  height: auto
  background: #121212
  padding: 4px
  margin: 2px
  font-size: 14px
  &-date
    display: inline
  &-body
    display: inline
  &-divider
    display: inline
.message-group
  padding: 4px
.group-name
  margin: 0
  margin-left: 12px
  padding: 0
  font-size: 14px
</style>

<script>
function groupMessages(messages) {
  let groups = [[messages[0]]]
  for (let mesg of messages.slice(1)) {
    if (mesg.user != groups[groups.length - 1][0].user) {
      groups.push([mesg])
    } else {
      groups[groups.length - 1].push(mesg)
    }
  }
  return groups
}
export default {
  data() {
    return {
      messageList: [
        {user: "billy", body: "test message 1", date: Date.now()},
        {user: "billy", body: "test message 2", date: Date.now()},
        {user: "jim", body: "test message 3", date: Date.now()},
        {user: "jim", body: "test message 4", date: Date.now()},
        {user: "jim", body: "test message 5", date: Date.now()},
      ]
    }
  },
  computed: {
    messages() {
      return groupMessages(this.messageList)
    }
  },
  methods: {
    formatDate(date) {
      return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
    }
  }
}
</script>