<template>
  <v-container grid-list-xl>
    <v-row justify="center">
      <v-col cols="12" align="center">
        <h1>Welcome to the waiting room</h1>
      </v-col>
      <Loading v-if="loading" />
      <v-col v-else cols="12" md="6" align="center">
        {{ user.profile.name }} your wait list status is:
        <span class="font-weight-bold text-uppercase">{{
          waitListItem.status
        }}</span>
      </v-col>
    </v-row>

    <ChatCard />
  </v-container>
</template>

<script>
import { mapState } from "vuex";
import firebase from "firebase/app";
import Loading from "@/components/Loading.vue";
import ChatCard from "@/components/ChatCard.vue";

export default {
  computed: mapState(["user", "waitListItem", "messages"]),
  data() {
    return {
      loading: true,
      newMessage: ""
    };
  },
  methods: {
    async loadWaitListStatus() {
      this.loading = true;
      const waitListItem = {
        venue: this.user.profile.waitingFor,
        user: this.user.data.uid
      };
      try {
        await this.$store.dispatch("bindSingleWaitListItem", waitListItem);
        this.loading = false;
      } catch (error) {
        alert("SingleWaitListItem: " + error);
      }
    }
  },
  components: { Loading, ChatCard },
  async created() {
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
