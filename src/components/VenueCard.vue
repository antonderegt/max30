<template>
  <Loading v-if="loadingVenue" />
  <v-container v-else>
    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-card max-width="400" class="mx-auto">
          <v-row v-if="venue === null">
            <v-col>
              <h3>No venue information...</h3>
            </v-col>
          </v-row>

          <v-row v-else class="pa-3" no-gutters>
            <v-col cols="12">
              <v-card-title>{{ venue.name }}</v-card-title>
              <v-card-subtitle v-if="venue.location">
                {{ venue.location.city }}, {{ venue.location.address }}
              </v-card-subtitle>
              <v-divider></v-divider>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="6">
              <v-card-text>Capaciteit: {{ venue.capacity }}</v-card-text>
            </v-col>

            <v-col cols="6">
              <v-card-text>Aanwezig: {{ venue.present }}</v-card-text>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col class="ma-3">
              <v-progress-linear xs12 v-model="progress" height="25" reactive>
                <strong>{{ venue.present }} / {{ venue.capacity }}</strong>
              </v-progress-linear>
            </v-col>
          </v-row>

          <v-row class="pa-3" justify="center" no-gutters>
            <v-col>
              Pas aanwezigen aan:
            </v-col>
          </v-row>

          <v-row>
            <v-col align="center">
              <v-btn color="success" @click="updatePresent(venue.present + 1)"
                >+</v-btn
              >
            </v-col>
            <v-col align="center">
              <v-btn color="error" @click="updatePresent(venue.present - 1)"
                >-</v-btn
              >
            </v-col>
          </v-row>
          <v-col v-if="isAdmin" align="center">
            <VueQrcode
              :value="`https://plekkie.me/venue/${venue.id}`"
              :options="{ width: 200 }"
            />
          </v-col>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="!isAdmin">
      <v-col v-if="waitList.length === 0" xs12>
        <v-card-text>Geen wachtrij, kom snel!</v-card-text>
      </v-col>

      <v-col xs12 class="pa-3">
        <v-btn outlined block @click="show = !show">Reserveer</v-btn>
        <JoinModal
          v-if="show"
          :show.sync="show"
          :count.sync="count"
          :venue="venue"
          :user="user"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-row v-if="waitList.length" xs12>
          <v-col>
            Wachtrij:
          </v-col>
        </v-row>
        <div v-if="!isAdmin">
          <v-row v-for="person in waitList" :key="person.id">
            <v-col>
              {{ person.name }}
            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>

    <Loading v-if="loadingWaitList" />

    <v-row v-if="isAdmin" class="pa-3" justify="center">
      <v-col
        cols="12"
        md="3"
        v-for="(person, index) in waitList"
        :key="person.id"
      >
        <v-card>
          <v-card-title>
            {{ person.name }}
          </v-card-title>
          <v-card-text> With {{ person.count }} people. </v-card-text>
          <chatCard
            v-if="openChat == index"
            :userProp="person.id"
            :venue="venue.id"
          />
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn
              color="success"
              @click="acceptOrDeclineGroup(person.id, person.count, 'accepted')"
            >
              yes
            </v-btn>
            <v-btn v-if="openChat != index" @click="openChat = index"
              >Chat</v-btn
            >
            <v-btn v-if="openChat == index" @click="openChat = -1"
              >Close Chat</v-btn
            >
            <v-btn
              color="error"
              @click="acceptOrDeclineGroup(person.id, person.count, 'declined')"
              >no</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from "vuex";
import Loading from "@/components/Loading.vue";
import JoinModal from "@/components/JoinModal.vue";
import ChatCard from "@/components/ChatCard.vue";
import VueQrcode from "@chenfengyuan/vue-qrcode";

export default {
  props: ["isAdmin"],
  computed: {
    progress() {
      return (this.venue.present / this.venue.capacity) * 100;
    },
    ...mapState(["venue", "waitList", "user"])
  },
  data() {
    return {
      venueID: "",
      loadingVenue: false,
      loadingWaitList: false,
      show: false,
      count: 1,
      openChat: -1
    };
  },
  methods: {
    async getVenue() {
      this.loadingVenue = true;
      try {
        await this.$store.dispatch("bindVenue", this.venueID);
        this.loadingVenue = false;
        this.loadingWaitList = true;
        await this.$store.dispatch("bindWaitList", this.venueID);
        this.loadingWaitList = false;
      } catch (error) {
        alert("bindVenue: " + error);
      }
    },
    async acceptOrDeclineGroup(userID, count, status) {
      let newCount = this.venue.present;

      if (status == "accepted") {
        newCount += parseInt(count);
      }

      try {
        await this.updatePresent(newCount);
        const waitList = {
          venue: this.venue.id,
          user: userID,
          status
        };
        await this.$store.dispatch("updateWaitList", waitList);
      } catch (error) {
        alert(error);
      }
    },
    async updatePresent(newValue) {
      let venue = {
        id: this.venue.id,
        present: newValue
      };

      try {
        await this.$store.dispatch("updatePresent", venue);
      } catch (error) {
        console.log(error);
      }
    }
  },
  components: {
    Loading,
    JoinModal,
    ChatCard,
    VueQrcode
  },
  created() {
    this.venueID = this.$route.params.venue;
    this.getVenue();
  }
};
</script>
