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
        <Loading v-if="loadingQueue" />
        <v-flex v-if="queue.length === 0" xs12>
          <v-card-text>Geen wachtrij...</v-card-text>
        </v-flex>
        <v-flex xs3 v-for="person in queue" :key="person.id">
          <v-btn outlined block>
            {{ person.name }}
          </v-btn>
        </v-flex>
      </v-layout>
    </v-card>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Loading from "@/components/Loading.vue";

export default {
  computed: mapState(["venue", "queue"]),
  data() {
    return {
      id: "",
      loadingVenue: false,
      loadingQueue: false,
      count: 1
    };
  },
  methods: {
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
              alert("bindQueue: " + error);
            });
        })
        .catch(error => {
          alert("bindHoreca: " + error);
        });
    }
  },
  components: {
    Loading,
  },
  created() {
    this.id = this.$route.params.id;
    this.getVenue();
  }
};
</script>
