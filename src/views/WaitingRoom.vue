<template>
  <v-container grid-list-xl>
    <v-layout row wrap justify-center>
      <v-flex xs12>
        <h1>Welcome to the waiting room</h1>
      </v-flex>
      <Loading v-if="loading" />
      <v-flex v-else xs12 md6>
        {{ user.profile.name }} your wait list status is:
        <span class="font-weight-bold text-uppercase">{{
          waitListItem.status
        }}</span>
      </v-flex>
    </v-layout>

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
