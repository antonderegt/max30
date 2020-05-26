<template>
  <div class="hello">
    <Loading v-show="loading" />
    <v-list two-line subheader>
      <!-- <v-list-item
        :to="'venue/' + venue.id"
        v-for="venue in venueList"
        :key="venue.id"
      >
        <v-list-item-content>
          <v-list-item-title>{{ venue.name }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ venue.location.address }}<br />
            {{ venue.location.postcode }} in {{ venue.location.city }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item> -->
      <!-- TODO: hadere restaruants: in Zwolle (postcode) -->
      <v-row>
        <v-col
          :to="'venue/' + venue.id"
          v-for="venue in filteredVenues"
          :key="venue.id"
          cols="12"
        >
          <v-card class="mx-auto" max-width="700" outlined>
            <v-list-item three-line>
              <v-list-item-content>
                <v-list-item-title class="headline mb-1">{{
                  venue.name
                }}</v-list-item-title>
                <v-list-item-subtitle>{{
                  venue.location.address
                }}</v-list-item-subtitle>
                <v-list-item-subtitle>{{
                  venue.location.city
                }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-progress-linear
              cols="12"
              :value="(venue.presentCount / venue.capacity) * 100"
              height="25"
              :color="getProgressColor(venue)"
              reactive
            >
              <strong>{{ venue.presentCount }} / {{ venue.capacity }}</strong>
            </v-progress-linear>
            <v-card-actions>
              <v-list-item-subtitle
                v-if="venue.waitinglist && venue.waitlist.length > 0"
              >
                Er staan
                <b>{{ venue.waitlist && venue.waitinglist.length }}</b> mensen
                in de wachtrij
              </v-list-item-subtitle>
              <v-list-item-subtitle
                v-if="venue.capacity === venue.presentCount"
              >
                <v-btn
                  :to="'venue/' + venue.id"
                  class="ma-2"
                  tile
                  outlined
                  color="success"
                >
                  <v-icon left>post_add</v-icon> Zet mij in de wachtrij
                </v-btn>
              </v-list-item-subtitle>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-list>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Loading from "@/components/Loading.vue";
import { getDistance, getBoundsOfDistance } from "geolib";

export default {
  props: {
    geo: {
      type: Object
    }
  },
  computed: mapState(["venueListAll", "venueListGeoBounded"]),
  data() {
    return {
      loading: false,
      filteredVenues: {}
    };
  },
  watch: {
    geo: async function() {
      await this.getVenueList(10000);
      this.calculateDistance();
    }
  },
  components: {
    Loading
  },
  methods: {
    async getVenueList(boxDistance) {
      this.loading = true;
      let boundingBox;

      if (this.geo.latitude !== undefined && this.geo.longitude !== undefined) {
        // Define a box (default = 10km) around coordinates
        boundingBox = getBoundsOfDistance(
          {
            latitude: this.geo.latitude,
            longitude: this.geo.longitude
          },
          boxDistance
        );
      } else {
        boundingBox = getBoundsOfDistance(
          { latitude: 52.37454030000001, longitude: 4.897975505617977 },
          boxDistance
        );
      }

      try {
        await this.$store.dispatch("bindGeoBoundedVenues", boundingBox);
        if (this.venueListGeoBounded.length === 0) {
          // Vergroot zoek gebied tot een venue is gevonden
          if (boxDistance < 500000) {
            this.getVenueList(boxDistance * 2);
          } else {
            this.$store.dispatch("setSnackbar", {
              show: true,
              text: "Onvindbare locatie, probeer het nog een keer."
            });
          }
        }
        this.calculateDistance();
      } catch (error) {
        alert("bindLocations: " + error);
      }
      this.loading = false;
    },
    calculateDistance() {
      this.venueListGeoBounded.map(venue => {
        const coord = {
          latitude: venue.location.geo.latitude,
          longitude: venue.location.geo.longitude
        };
        venue.distance = getDistance(coord, this.geo);
      });
      this.filteredVenues = this.venueListGeoBounded.sort((a, b) => {
        if (a.distance < b.distance) {
          return -1;
        } else if (a.distance > b.distance) {
          return 1;
        }
        return 0;
      });
    },
    getProgressColor(venue) {
      let progess = (venue.presentCount / venue.capacity) * 100;
      if (progess < 80) return "green";
      if (progess < 99) return "orange";
      return "red";
    }
  },
  created() {
    this.getVenueList(10000);
  }
};
</script>
