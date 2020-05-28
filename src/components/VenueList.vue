<template>
  <Loading v-if="loading" />
  <v-list v-else two-line subheader>
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
            <strong v-if="venue.presentCount >= venue.capacity">VOL</strong>
            <strong v-else
              >{{ venue.presentCount }} / {{ venue.capacity }}</strong
            >
          </v-progress-linear>
          <v-card-actions>
            <v-list-item-subtitle
              v-if="venue.waitinglist && venue.waitlist.length > 0"
            >
              Er staan
              <b>{{ venue.waitlist && venue.waitinglist.length }}</b> mensen in
              de wachtrij
            </v-list-item-subtitle>
            <v-list-item-subtitle v-if="venue.capacity <= venue.presentCount">
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
</template>

<script>
import { mapState } from "vuex";
import Loading from "@/components/Loading.vue";
import { getDistance } from "geolib";

export default {
  props: {
    geo: {
      type: Object
    }
  },
  computed: mapState(["venueListGeoBounded"]),
  data() {
    return {
      loading: false,
      filteredVenues: {}
    };
  },
  watch: {
    geo: function() {
      this.getVenueList(3);
    }
  },
  components: {
    Loading
  },
  methods: {
    async getVenueList(distance) {
      this.loading = true;

      if (this.geo.latitude == undefined || this.geo.longitude == undefined) {
        console.log("lat or lon undefined");
        this.loading = false;
        return;
      }

      const location = {
        latitude: parseFloat(this.geo.latitude),
        longitude: parseFloat(this.geo.longitude),
        distance
      };

      try {
        await this.$store.dispatch("bindGeoBoundedVenues", location);
        if (!this.venueListGeoBounded?.length) {
          // Vergroot zoek gebied tot een venue is gevonden
          if (distance < 500) {
            this.$store.dispatch("setSnackbar", {
              show: true,
              text: "Zoek gebied wordt vergroot."
            });
            this.getVenueList(distance + 1.5);
          } else {
            this.$store.dispatch("setSnackbar", {
              show: true,
              text: "Onvindbare locatie, probeer het nog een keer."
            });
          }
          return;
        }
        this.$store.dispatch("setSnackbar", {
          show: false,
          text: ""
        });
        this.calculateDistance();
        this.loading = false;
      } catch (error) {
        alert("bindGeoBoundedVenues: " + error);
      }
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
        return a.distance === b.distance ? 0 : a.distance < b.distance ? -1 : 1;
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
    this.getVenueList(3);
  }
};
</script>
