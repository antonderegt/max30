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
          <v-card-text>Waitlist:</v-card-text>
        </v-flex>
        <Loading v-if="loadingQueue" />
        <v-flex v-if="waitlist.length === 0" xs12>
          <v-card-text>No waitlist...</v-card-text>
        </v-flex>
        <v-flex xs12 v-for="person in waitlist" :key="person.id" class="pa-3">
          <v-card>
            <v-card-title>
              {{ person.name }}
            </v-card-title>
            <v-card-text> With {{ person.count }} people. </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
              <v-btn
                color="success"
                @click="acceptGroup(person.id, person.count)"
                >accept</v-btn
              >
              <v-spacer></v-spacer>
              <v-btn color="error" @click="declineGroup">decline</v-btn>
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
  computed: mapState(["venue", "waitlist"]),
  data() {
    return {
      id: "",
      loadingVenue: false,
      loadingQueue: false,
      count: 1
    };
  },
  methods: {
    acceptGroup(id, count) {
      const venue = {
        id: this.venue.id,
        present: this.venue.present + parseInt(count)
      };
      this.$store.dispatch("updatePresent", venue).then(() => {
        const waitlist = {
          venue: this.venue.id,
          user: id,
          status: "accepted"
        };
        this.$store.dispatch("updateWaitList", waitlist);
      });
    },
    declineGroup() {},
    getVenue() {
      this.loadingVenue = true;
      this.$store
        .dispatch("bindVenue", this.id)
        .then(() => {
          this.loadingVenue = false;
          this.loadingQueue = true;
          this.$store
            .dispatch("bindQueue", this.id)
            .then(() => {
              this.loadingQueue = false;
            })
            .catch(error => {
              console.log("bindQueue: " + error);
            });
        })
        .catch(error => {
          alert("bindHoreca: " + error);
        });
    }
  },
  components: {
    Loading
  },
  created() {
    this.id = this.$route.params.id;
    this.getVenue();
  }
};
</script>
