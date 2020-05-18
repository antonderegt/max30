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
          <v-card-text>Capacity: {{ venue.capacity }}</v-card-text>
        </v-flex>
        <v-flex xs6>
          <v-card-text>Present: {{ venue.present }}</v-card-text>
        </v-flex>
        <v-flex xs12>
          <v-card-text>Wait list:</v-card-text>
        </v-flex>
        <Loading v-if="loadingWaitList" />
        <v-flex v-if="waitList.length === 0" xs12>
          <v-card-text>No wait list...</v-card-text>
        </v-flex>
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
      </v-layout>
    </v-card>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Loading from "@/components/Loading.vue";

export default {
  computed: mapState(["venue", "waitList"]),
  data() {
    return {
      venueID: "",
      loadingVenue: false,
      loadingWaitList: false,
      count: 1
    };
  },
  methods: {
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
    },
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
    }
  },
  components: {
    Loading
  },
  created() {
    this.venueID = this.$route.params.venue;
    this.getVenue();
  }
};
</script>
