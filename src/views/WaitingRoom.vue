<template>
  <v-container grid-list-xl>
    <v-row>
      <v-col cols="12" align="center">
        <h1>Welcome to the waiting room</h1>
      </v-col>
    </v-row>
    <Loading v-if="loadingWaitLists" />
    <v-row v-else-if="waitLists.length === 0">
      <v-col>You are not on any wait list at the moment.</v-col>
    </v-row>
    <v-row
      v-else
      v-for="(waitListItem, index) in waitLists"
      justify="center"
      :key="waitListItem.id"
    >
      <v-col cols="12" md="6" align="center">
        {{ user.profile.name }} your wait list status for
        {{ waitListItem.venueID }} is:
        <span class="font-weight-bold text-uppercase">{{
          waitListItem.status
        }}</span>
      </v-col>
      <v-btn v-if="showChat !== index" @click="showChat = index"
        >Show chat</v-btn
      >
      <v-btn v-else-if="showChat === index" @click="showChat = -1"
        >Hide chat</v-btn
      >
      <ChatCard
        v-if="showChat === index"
        :venueID="waitListItem.venueID"
        :userID="waitListItem.userID"
        sender="user"
      />
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from "vuex";
import firebase from "firebase/app";
import Loading from "@/components/Loading.vue";
import ChatCard from "@/components/ChatCard.vue";

export default {
  computed: mapState(["user", "waitLists"]),
  data() {
    return {
      loadingWaitLists: false,
      showChat: -1,
      newMessage: ""
    };
  },
  methods: {
    async loadWaitListStatus() {
      this.loadingWaitLists = true;
      try {
        await this.$store.dispatch("bindWaitLists", this.user.data.uid);
        this.loadingWaitLists = false;
      } catch (error) {
        alert("bindWaitLists: " + error);
      }
    }
  },
  components: { Loading, ChatCard },
  async created() {
    this.loadingWaitLists = true;
    await firebase.getCurrentUser();
    await this.$store.dispatch("fetchProfile", this.user.data.uid);
    this.loadWaitListStatus();
  }
};
</script>

<style scoped>
.messages-container {
  overflow-y: auto;
}

.messages {
  max-height: 150px;
  overflow-x: hidden;
}

.chat-message {
  margin: 4px;
  padding: 4px;
  border-radius: 6px;
}

.owner {
  background-color: lightblue;
}
</style>
