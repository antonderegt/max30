<template>
  <v-container>
    <Loading v-if="loading" />
    <v-row justify="center">
      <v-col cols="12">
        <v-card v-if="messages.length > 0" class="messages-container">
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
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from "vuex";
import firebase from "firebase/app";
import { db, Timestamp } from "@/db.js";
import Loading from "@/components/Loading.vue";

export default {
  props: ["userProp", "venue"],
  computed: mapState(["user", "messages"]),
  data() {
    return {
      loading: false,
      newMessage: ""
    };
  },
  methods: {
    async getMessages() {
      let waitListItem = {};
      console.log(this.venue);
      console.log(this.userProp);

      if (this.userProp === undefined) {
        waitListItem = {
          venue: this.user.profile.waitingFor,
          user: this.user.data.uid
        };
      } else {
        waitListItem = {
          venue: this.venue,
          user: this.userProp
        };
      }
      try {
        this.loading = true;
        await this.$store.dispatch("bindMessages", waitListItem);
        this.loading = false;
      } catch (error) {
        this.loading = false;
        console.log(error);
      }
    },
    async sendMessage() {
      if (this.newMessage) {
        let venueDoc = this.user.profile.waitingFor;
        let name = this.user.profile.name;
        let sendByOwner = false;
        let userDoc = this.user.data.uid;
        if (this.venue !== undefined) {
          name = "Owner";
          sendByOwner = true;
          userDoc = this.userProp;
          venueDoc = this.venue;
        }
        await db
          .collection("venues")
          .doc(venueDoc)
          .collection("waitlist")
          .doc(userDoc)
          .collection("messages")
          .add({
            name: name,
            content: this.newMessage,
            sendByOwner: sendByOwner,
            timestamp: Timestamp.fromDate(new Date())
          });
        this.newMessage = "";
      }
    }
  },
  components: { Loading },
  async created() {
    await firebase.getCurrentUser();
    await this.$store.dispatch("fetchProfile", this.user.data.uid);
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
