<template>
  <v-container>
    <Loading v-if="loading" />
    <v-row justify="center">
      <v-col cols="12">
        <v-card v-if="chat.length > 0" class="messages-container">
          <div class="messages" v-chat-scroll>
            <div class="message" v-for="message in chat" :key="message.id">
              <div v-if="message.sendBy === 'owner'" class="chat-message owner">
                <span class="green--text">Eigenaar - </span>
                <span class="darkgrey--text">{{ message.content }}</span>
                <span class="grey--text">
                  {{
                    message.timestamp
                      .toDate()
                      .toLocaleTimeString(undefined, options)
                  }}
                </span>
              </div>
              <div
                v-else-if="message.sendBy === 'user'"
                class="text-right chat-message"
              >
                <span class="darkgrey--text">{{ message.content }} - </span>
                <!-- TODO show users name -->
                <span class="green--text">Klant</span>
                <span class="grey--text">
                  {{
                    message.timestamp
                      .toDate()
                      .toLocaleTimeString(undefined, options)
                  }}</span
                >
              </div>
            </div>
          </div>
          <v-divider></v-divider>
          <v-container fluid>
            <v-row justify="center">
              <v-col cols="10" md="11">
                <v-form @submit.prevent="sendMessage">
                  <v-text-field
                    :label="user.profile.name"
                    v-model="newMessage"
                  ></v-text-field>
                </v-form>
              </v-col>
              <v-col cols="2" md="1" class="text-center">
                <v-btn color="success" @click="sendMessage" class="pt-3" icon>
                  <v-icon>mdi-send</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
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
  props: ["venueID", "userID", "sender"],
  computed: mapState(["user", "chat"]),
  data() {
    return {
      loading: false,
      newMessage: "",
      options: {
        hour: "numeric",
        minute: "numeric"
      }
    };
  },
  methods: {
    async getMessages() {
      this.loading = true;
      let chat = {};
      if (this.userID === undefined || this.venueID === undefined) {
        console.log("No user or venue provided");
      } else {
        chat = {
          venueID: this.venueID,
          userID: this.userID
        };
      }
      try {
        await this.$store.dispatch("bindChat", chat);
      } catch (error) {
        console.log(error);
      }
      this.loading = false;
    },
    async sendMessage() {
      if (this.newMessage) {
        let venueID = this.venueID;
        let userID = this.userID;
        let sendBy = this.sender;
        await db
          .collection("chats")
          .doc(`${venueID}_${userID}`)
          .collection("messages")
          .add({
            venueID,
            userID,
            sendBy,
            content: this.newMessage,
            timestamp: Timestamp.fromDate(new Date())
          });
        this.newMessage = "";
      }
    }
  },
  components: { Loading },
  async created() {
    this.loading = true;
    await firebase.getCurrentUser();
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
  background-color: rgb(242, 255, 236);
}
</style>
