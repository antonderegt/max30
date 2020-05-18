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
    <v-layout v-if="!loading" row wrap justify-center>
      <v-flex xs12>
        <v-card class="messages-container">
          <div class="messages" v-chat-scroll>
            <div class="message" v-for="message in messages" :key="message.id">
              <div v-if="message.sendByOwner" class="chat-message owner">
                <span class="green--text">{{ message.name }} - </span>
                <span class="grey--text">{{ message.content }}</span>
                <!-- <span class="grey--text">{{ message.timestamp }}</span> -->
              </div>
              <div v-else class="text-right chat-message">
                <span class="grey--text">{{ message.content }} - </span>
                <span class="green--text">{{ message.name }}</span>
                <!-- <span class="grey--text">{{ message.timestamp }}</span> -->
              </div>
            </div>
          </div>
        </v-card>
        <v-card>
          <v-form @submit.prevent="sendMessage">
            <v-text-field
              class="pa-3"
              :label="user.profile.name"
              v-model="newMessage"
            ></v-text-field>
          </v-form>
          <v-card-actions>
            <v-btn color="success" @click="sendMessage">Send</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from "vuex";
import firebase from "firebase/app";
import { db, Timestamp } from "@/db.js";
import Loading from "@/components/Loading.vue";

export default {
  computed: mapState(["user", "waitListItem", "messages"]),
  data() {
    return {
      loading: true,
      newMessage: ""
    };
  },
  methods: {
    getMessages() {
      const waitListItem = {
        venue: this.user.profile.waitingFor,
        user: this.user.data.uid
      };
      this.$store.dispatch("bindMessages", waitListItem);
    },
    async sendMessage() {
      if (this.newMessage) {
        await db
          .collection("venues")
          .doc(this.user.profile.waitingFor)
          .collection("waitlist")
          .doc(this.user.data.uid)
          .collection("messages")
          .add({
            name: this.user.profile.name,
            content: this.newMessage,
            timestamp: Timestamp.fromDate(new Date())
          });
        this.newMessage = "";
      }
    },
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
  components: { Loading },
  async created() {
    await firebase.getCurrentUser();
    await this.$store.dispatch("fetchProfile", this.user.data.uid);
    this.loadWaitListStatus();
    this.getMessages();
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
