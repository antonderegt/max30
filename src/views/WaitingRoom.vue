<template>
  <v-container grid-list-xl>
    <v-row>
      <v-col cols="12" align="center">
        <h1>Welkom in de wachtruimte</h1>
      </v-col>
    </v-row>
    <Loading v-if="loadingWaitLists" />
    <v-row v-else-if="!waitListsByUser.length">
      <v-col class="text-center">Je staat nog niet op een wachtlijst.</v-col>
    </v-row>
    <v-row
      v-else
      v-for="(item, index) in waitListsWithName"
      :key="item.id"
      justify="center"
    >
      <v-col cols="12" md="6">
        <v-card :color="color[item.status]">
          <v-card-title
            >{{ item.venueName }} - {{ item.personCount }}
            {{ item.personCount === 1 ? "persoon" : "personen" }}</v-card-title
          >
          <v-card-subtitle>{{
            item.timestamp.toDate().toLocaleDateString("nl", options)
          }}</v-card-subtitle>
          <v-card-text v-if="item.status === 'waiting'">
            <v-row
              ><v-col
                >{{ user.profile.name }} de status van jou reservering is:
                {{ status[item.status] }}</v-col
              >
            </v-row>
            <v-row
              ><v-col v-if="peopleInFront.groups <= 0">
                Je bent de eerst volgende!
              </v-col>
              <v-col v-else>
                Er staat {{ peopleInFront.groups }}
                {{ peopleInFront.groups === 1 ? "groep" : "groepen" }} voor je
                met in totaal {{ peopleInFront.people }}
                {{ peopleInFront.people === 1 ? "persoon" : "personen" }}.
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-text v-else> Status: {{ item.status }} </v-card-text>
          <v-divider v-if="item.status !== 'deleted'"></v-divider>
          <v-card-actions v-if="item.status !== 'deleted'">
            <v-btn v-if="showChat === -1" @click="showChat = index"
              >Show chat</v-btn
            >
            <v-btn v-else-if="showChat === index" @click="showChat = -1"
              >Hide chat</v-btn
            >
            <v-spacer></v-spacer>
            <v-btn
              v-if="item.status === 'waiting'"
              color="error"
              @click="cancelWaitListItem(item.id)"
              >Cancel</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
      <ChatCard
        v-if="showChat === index"
        :venueID="item.venueID"
        :userID="item.userID"
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
  computed: mapState(["user", "waitListsByUser", "waitListInFrontOfUser"]),
  data() {
    return {
      loadingWaitLists: false,
      showChat: -1,
      newMessage: "",
      waitListLength: 0,
      waitListsWithName: [],
      peopleInFront: {
        groups: 0,
        people: 0
      },
      options: {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric"
      },
      color: {
        accepted: "success",
        declined: "warning",
        waiting: ""
      },
      status: {
        waiting: "WACHT UIT",
        declined: "Afgekeurd",
        accepted: "Succes!"
      }
    };
  },
  watch: {
    async waitListInFrontOfUser() {
      await this.filterVenues();
      this.countPeopleInFront();
    },
    async waitListsByUser() {
      await this.filterVenues();
    }
  },
  methods: {
    async loadWaitListStatus() {
      this.loadingWaitLists = true;
      try {
        // get venueID:
        await this.$store.dispatch("bindWaitListsByUser", this.user.data.uid);
        if (!this.waitListsByUser.length) {
          this.loadingWaitLists = false;
          return;
        }

        // get venue name and order
        await this.filterVenues();

        // get count of people in front of user
        const waitListItem = {
          venueID: this.waitListsByUser[0].venueID,
          timestamp: this.waitListsByUser[0].timestamp
        };
        await this.$store.dispatch("bindWaitListInFrontOfUser", waitListItem);
        this.countPeopleInFront();

        this.loadingWaitLists = false;
      } catch (error) {
        alert("bindWaitListsByUser: " + error);
      }
    },
    async filterVenues() {
      // Filter out deleted items
      this.waitListsWithName = this.waitListsByUser.filter(waitListItem => {
        if (waitListItem.status !== "deleted") {
          return waitListItem;
        }
      });

      // Get names of venues
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
            waitListItem.venueName = res;
          }
        })
      );

      // Sort on timestamp
      this.waitListsWithName = this.waitListsWithName.sort((a, b) => {
        return a.timestamp === b.timestamp
          ? 0
          : a.timestamp < b.timestamp
          ? 1
          : -1;
      });
    },
    countPeopleInFront() {
      this.peopleInFront = {
        groups: this.waitListInFrontOfUser.length,
        people: 0
      };
      this.waitListInFrontOfUser.forEach(i => {
        this.peopleInFront.people += i.personCount;
      });
    },
    async cancelWaitListItem(waitListID) {
      const waitListItem = {
        waitListID,
        status: "deleted"
      };
      try {
        this.$store.dispatch("setSnackbar", {
          show: true,
          text: "Reservering verwijderd"
        });
        await this.$store.dispatch("updateWaitList", waitListItem);
        this.countPeopleInFront();
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
