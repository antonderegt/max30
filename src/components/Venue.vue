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
        <v-flex xs12>
          <v-card-text>Wachtrij:</v-card-text>
        </v-flex>
        <Loading v-if="loadingWaitList" />
        <v-flex v-if="waitList.length === 0" xs12>
          <v-card-text>Geen wachtrij, kom snel!</v-card-text>
        </v-flex>
        <v-flex xs3 v-for="person in waitList" :key="person.id">
          <v-btn outlined block>
            {{ person.name }}
          </v-btn>
        </v-flex>
        <v-flex xs12 class="pa-3">
          <v-btn outlined block @click="show = !show">JOIN</v-btn>
          <JoinModal
            v-if="show"
            :show.sync="show"
            :count.sync="count"
            :venue="venue"
            :user="user"
          />
        </v-flex>
      </v-layout>
    </v-card>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Loading from "@/components/Loading.vue";
import JoinModal from "@/components/JoinModal.vue";

export default {
  computed: mapState(["venue", "waitList", "user"]),
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
    getVenue() {
      this.loadingVenue = true;
      this.$store
        .dispatch("bindVenue", this.venueID)
        .then(() => {
          this.loadingVenue = false;
          this.loadingWaitList = true;
          this.$store
            .dispatch("bindWaitList", this.venueID)
            .then(() => {
              this.loadingWaitList = false;
            })
            .catch(error => {
              alert("bindWaitList: " + error);
            });
        })
        .catch(error => {
          alert("bindVenue: " + error);
        });
    }
  },
  components: {
    Loading,
    JoinModal
  },
  created() {
    this.venueID = this.$route.params.venue;
    this.getVenue();
  }
};
</script>
