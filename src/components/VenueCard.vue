<template>
  <Loading v-if="loadingVenue" />
  <div v-else>
    <v-card class="mx-auto my-5" max-width="343" outlined>
      <v-layout v-if="venue === null">
        <v-flex>
          <h3>No venue information...</h3>
        </v-flex>
      </v-layout>

      <v-layout v-else row wrap class="pa-3" justify-space-around>
        <v-flex xs12>
          <v-card-title>{{ venue.name }}</v-card-title>
          <v-card-subtitle v-if="venue.location">
            {{ venue.location.city }}, {{ venue.location.address }}
          </v-card-subtitle>
          <v-divider></v-divider>
        </v-flex>
        <v-flex xs6>
          <v-card-text>Capaciteit: {{ venue.capacity }}</v-card-text>
        </v-flex>
        <v-flex xs6>
          <v-card-text>Aanwezig: {{ venue.present }}</v-card-text>
        </v-flex>
        <v-progress-linear xs12 v-model="progress" height="25" reactive>
          <strong>{{ venue.present }} / {{ venue.capacity }}</strong>
        </v-progress-linear>
        <v-flex v-if="waitList.length" xs12>
          <v-card-text>Wachtrij:</v-card-text>
        </v-flex>
        <Loading v-if="loadingWaitList" />

        <div v-if="!isAdmin">
          <v-flex v-if="waitList.length === 0" xs12>
            <v-card-text>Geen wachtrij, kom snel!</v-card-text>
          </v-flex>

          <v-flex xs12 class="pa-3">
            <v-btn outlined block @click="show = !show">Reserveer</v-btn>
            <JoinModal
              v-if="show"
              :show.sync="show"
              :count.sync="count"
              :venue="venue"
              :user="user"
            />
          </v-flex>
        </div>

        <div v-if="isAdmin">
          <v-flex v-if="waitList.length" xs12>
            <v-card-text>Wait list:</v-card-text>
          </v-flex>
          <Loading v-if="loadingWaitList" />
          <v-flex xs12 v-for="person in waitList" :key="person.id" class="pa-3">
            <v-card>
              <v-card-title>
                {{ person.name }}
              </v-card-title>
              <v-card-text> With {{ person.count }} people. </v-card-text>
              <v-divider></v-divider>
              <v-card-actions>
                <v-btn
                  color="success"
                  @click="
                    acceptOrDeclineGroup(person.id, person.count, 'accepted')
                  "
                >
                  accept
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                  color="error"
                  @click="
                    acceptOrDeclineGroup(person.id, person.count, 'declined')
                  "
                  >decline</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-flex>
          <v-flex xs12 ma-5>
            <v-card>
              <VueQrcode
                :value="
                  `https://max30-max100.firebaseapp.com/venue/${venue.id}`
                "
                :options="{ width: 200 }"
              />
            </v-card>
          </v-flex>
        </div>
      </v-layout>
    </v-card>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Loading from "@/components/Loading.vue";
import JoinModal from "@/components/JoinModal.vue";
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
      count: 1
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
      let venue = {
        id: this.venue.id,
        present: this.venue.present
      };
      if (status == "accepted") {
        venue.present += parseInt(count);
      }
      try {
        await this.$store.dispatch("updatePresent", venue);
        const waitList = {
          venue: this.venue.id,
          user: userID,
          status
        };
        await this.$store.dispatch("updateWaitList", waitList);
      } catch (error) {
        alert(error);
      }
    }
  },
  components: {
    Loading,
    JoinModal,
    VueQrcode
  },
  created() {
    this.venueID = this.$route.params.venue;
    this.getVenue();
  }
};
</script>
