<template>
  <v-container grid-list-xl>
    <v-row>
      <v-col cols="12" align="center">
        <h1>Welcome to the waiting room</h1>
      </v-col>
    </v-row>
    <Loading v-if="loadingWaitLists" />
    <v-row v-else-if="waitListsWithName.length == 0">
      <v-col>You are not on any wait list at the moment.</v-col>
    </v-row>
    <v-row
      v-else
      v-for="(waitListItem, index) in waitListsWithName"
      justify="center"
      :key="waitListItem.id"
    >
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>{{ waitListItem.name }}</v-card-title>
          <v-card-subtitle>{{
            waitListItem.timestamp
              .toDate()
              .toLocaleDateString(undefined, options)
          }}</v-card-subtitle>
          <v-card-text>
            {{ user.profile.name }} de status is: {{ waitListItem.status }}, met
            {{ waitListItem.peopleInFront }} mensen voor je.
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn v-if="showChat !== index" @click="showChat = index"
              >Show chat</v-btn
            >
            <v-btn v-else-if="showChat === index" @click="showChat = -1"
              >Hide chat</v-btn
            >
            <v-spacer></v-spacer>
            <v-btn
              color="error"
              @click="cancelWaitListItem(waitListItem.id, waitListItem.venueID)"
              >Cancel</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12">
        <ChatCard
          v-if="showChat === index"
          :venueID="waitListItem.venueID"
          :userID="waitListItem.userID"
          sender="user"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from "vuex";
import firebase from "firebase/app";
import Loading from "@/components/Loading.vue";
import ChatCard from "@/components/ChatCard.vue";

export default {
  computed: mapState(["user", "waitListsByUser"]),
  data() {
    return {
      loadingWaitLists: false,
      showChat: -1,
      newMessage: "",
      waitListLength: 0,
      waitListsWithName: [],
      options: {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric"
      }
    };
  },
  methods: {
    async loadWaitListStatus() {
      this.loadingWaitLists = true;
      try {
        await this.$store.dispatch("bindWaitListsByUser", this.user.data.uid);
        await this.filterVenues();

        this.loadingWaitLists = false;
      } catch (error) {
        alert("bindWaitListsByUser: " + error);
      }
    },
    async filterVenues() {
      this.waitListsWithName = this.waitListsByUser.filter(waitListItem => {
        if (waitListItem.status !== "deleted") {
          return waitListItem;
        }
      });
      await Promise.all(
        this.waitListsWithName.map(async waitListItem => {
          const res = await this.$store.dispatch(
            "getVenueName",
            waitListItem.venueID
          );
          if (res === undefined) {
            waitListItem.name = "Deze venue bestaat niet meer";
            waitListItem.peopleInFront = 0;
          } else {
            waitListItem.name = res;
            const venueIDTimestamp = {
              venueID: waitListItem.venueID,
              timestamp: waitListItem.timestamp
            };

            const waitList = await this.$store.dispatch(
              "getWaitListInFrontOfUser",
              venueIDTimestamp
            );

            if (waitList !== undefined) {
              let people = 0;
              waitList.forEach(i => {
                people += parseInt(i.data().personCount);
              });
              waitListItem.peopleInFront = people;
            } else {
              waitListItem.peopleInFront = 0;
            }
          }
        })
      );
    },
    async cancelWaitListItem(waitListID) {
      const waitListItem = {
        waitListID,
        status: "deleted"
      };
      try {
        await this.$store.dispatch("updateWaitList", waitListItem);
        this.filterVenues();
      } catch (error) {
        console.log(error);
      }
    }
  },
  components: { Loading, ChatCard },
  async created() {
    this.loadingWaitLists = true;
    await firebase.getCurrentUser();
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
