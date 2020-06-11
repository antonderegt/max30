<template>
  <Loading v-if="loading" />
  <v-list
    v-else
    two-line
    subheader
    color="rgb(255, 0, 0, 0)"
    style="max-height: calc(100vh - 280px)"
    class="overflow-y-auto overflow-x-hidden"
  >
    <!-- TODO: hadere restaruants: in Zwolle (postcode) -->
    <v-row>
      <v-col
        :to="'venue/' + venue.id"
        v-for="venue in filteredVenues"
        :key="venue.id"
        cols="12"
      >
        <v-card
          color="info"
          class="mx-auto"
          max-width="700"
          :ripple="{ class: 'secondary--text' }"
          :to="'venue/' + venue.id"
        >
          <v-list-item three-line>
            <v-list-item-content class="dark--text">
              <v-list-item-title class="headline mb-1">{{
                venue.name
              }}</v-list-item-title>
              <v-list-item-subtitle class="semidark--text">{{
                venue.location.address
              }}</v-list-item-subtitle>
              <v-list-item-subtitle class="semidark--text">{{
                venue.location.city
              }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-progress-linear
            cols="12"
            :value="(venue.presentCount / venue.capacity) * 100"
            height="25"
            :color="getProgressColor(venue).background"
            reactive
          >
            <strong
              v-if="venue.presentCount >= venue.capacity"
              :class="getProgressColor(venue).text"
              >VOL</strong
            >
            <strong v-else :class="getProgressColor(venue).text"
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
              <v-btn :to="'venue/' + venue.id" class="ma-2" color="secondary">
                <v-icon left>post_add</v-icon> Stap in de wachtrij
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
  computed: mapState(["venueListGeoBounded", "searchLocation"]),
  data() {
    return {
      loading: false,
      filteredVenues: {}
    };
  },
  watch: {
    geo: function() {
      this.getVenueList(4);
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
        await this.$store.dispatch("getGeoBoundedVenues", location);
        if (!this.venueListGeoBounded?.length) {
          // Vergroot zoek gebied tot een venue is gevonden
          if (distance < 500) {
            this.$store.dispatch("setSnackbar", {
              show: true,
              text: "Zoekgebied wordt vergroot."
            });
            this.getVenueList(distance + 1);
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
      let progress = (venue.presentCount / venue.capacity) * 100;
      if (progress < 80) return { background: "secondary", text: "dark--text" };
      if (progress < 99) return { background: "secondary", text: "dark--text" };
      return { background: "primary", text: "info--text" };
    }
  },
  created() {
    if (this.searchLocation !== "") {
      this.calculateDistance();
      return;
    }

    this.getVenueList(4);
  }
};
</script>
