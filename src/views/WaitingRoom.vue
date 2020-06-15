<template>
  <v-container grid-list-xl class="info--text">
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
        <v-card :color="color[item.status]" class="dark--text">
          <v-card-title
            >{{ item.venueName ? item.venueName : "Deze plek is verwijderd" }} -
            {{ user.data.displayName }} ({{ item.personCount }})</v-card-title
          >
          <v-card-subtitle class="semidark--text">{{
            item.timestamp.toDate().toLocaleDateString("nl", options)
          }}</v-card-subtitle>
          <v-card-text
            v-if="item.awaitingArrival && item.status == 'waiting'"
            class="dark--text"
          >
            <p v-if="formattedTimeLeft != '00:00'">
              Claim je plekkie binnen
              <span class="font-weight-bold"
                >{{ formattedTimeLeft }} 🏃🏽‍♀🏃🏻‍♂️</span
              >
            </p>
            <p v-else>
              Je bent helaas te laat om je plekkie te claimen 🤷🏾‍♀️
            </p>
          </v-card-text>
          <v-card-text v-else-if="item.status === 'waiting'" class="dark--text">
            <v-row>
              <v-col>
                <b>{{ status[item.status] }}</b>
              </v-col>
            </v-row>
            <v-row
              ><v-col v-if="peopleInFront.groups <= 0">
                Je bent de eerst volgende!
              </v-col>
              <v-col v-else>
                {{ peopleInFront.people }}
                {{ peopleInFront.people === 1 ? "Persoon" : "Personen" }} voor
                je.
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-text class="dark--text" v-else
            >{{ status[item.status] }}
          </v-card-text>
          <v-divider v-if="item.status == 'waiting'"></v-divider>
          <v-card-actions v-if="item.status !== 'deleted'">
            <v-spacer></v-spacer>
            <v-btn
              v-if="item.status === 'waiting'"
              color="secondary"
              class="dark--text"
              @click="cancelWaitListItem(item.id)"
              >Cancel</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col v-if="waitListsWithName.length > 1" cols="12" class="text-center">
        <h1>{{ index == 0 ? "Verleden" : "" }}</h1>
        <v-divider v-if="index == 0"></v-divider>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from "vuex";
import firebase from "firebase/app";
import Loading from "@/components/Loading.vue";

export default {
  computed: {
    formattedTimeLeft() {
      const timeLeft = Math.floor(this.timerCount);
      if (timeLeft <= 0) {
        return "00:00";
      }
      const minutes = Math.floor(timeLeft / 60);
      let seconds = timeLeft % 60;
      if (seconds < 10) {
        seconds = `0${seconds}`;
      }
      // The output in MM:SS format
      return `${minutes}:${seconds}`;
    },
    ...mapState(["user", "waitListsByUser", "waitListInFrontOfUser"])
  },
  data() {
    return {
      timerCount: null,
      loadingWaitLists: false,
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
        accepted: "info",
        declined: "info",
        waiting: "info",
        inside: "info"
      },
      status: {
        waiting: "Nog even geduld a.u.b. 💆🏾‍♂️⏳💆🏻‍♀️",
        declined: "Je aanvraag is helaas afgekeurd... 🤧",
        accepted: "Je mag naar binnen! 👯‍♀️ Veel plezier 🎉"
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
    },
    timerCount: {
      handler(value) {
        if (value > 1) {
          setTimeout(() => {
            this.timerCount--;
          }, 1000);
        }
      }
    }
  },
  methods: {
    async loadWaitListStatus() {
      this.loadingWaitLists = true;
      try {
        // Get venueID:
        await this.$store.dispatch("bindWaitListsByUser", this.user.data.uid);
        if (!this.waitListsByUser.length) {
          this.loadingWaitLists = false;
          return;
        }

        // Get venue name and order
        await this.filterVenues();

        // Get count of people in front of user
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

      if (
        this.waitListsWithName[0]?.awaitingArrival &&
        this.timerCount == null
      ) {
        this.timerCount =
          (this.waitListsWithName[0].updateTimestamp.toMillis() +
            1000 * 60 * 15 -
            Date.now()) /
          1000;
      }
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
  components: { Loading },
  async created() {
    this.loadingWaitLists = true;
    await firebase.getCurrentUser();
    this.loadWaitListStatus();
  }
};
</script>
