<template>
  <v-container fluid class="ma-0 pa-0">
    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-card-title class="headline lighten-2" primary-title>
          Gezondheidsverklaring
        </v-card-title>

        <v-card-text>
          Verklaart u en gezelschap naar eigen weten gezond te zijn? U heeft
          geen klachten die duiden op besmetting van Corona
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="declaredHealthy()">
            Ik ben gezond
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-img
      height="93vh"
      src="https://images.unsplash.com/photo-1549807315-f5fa45619e33?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=975&q=80"
    >
      <!-- https://cdn.vuetifyjs.com/images/parallax/material.jpg -->
      <v-row align="center" justify="center">
        <v-col cols="12" class="text-center">
          <h1 class="display-1 font-weight-thin mb-4 info--text">
            <b> Plekkie laat zien waar plek is!</b>
          </h1>
          <h4 class="subheading"></h4>
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col cols="12" sm="6" md="4">
          <v-toolbar
            class="mx-2"
            style="border-radius: .5rem"
            rounded
            dense
            color="info"
          >
            <v-text-field
              v-model="searchField"
              hide-details
              autofocus
              clearable
              placeholder="Plaatsnaam of postcode"
              prepend-icon="search"
              single-line
              :disabled="loading"
              color="secondary"
            ></v-text-field>

            <v-btn @click="requestLocation()" class="secondary--text" icon>
              <v-progress-circular
                v-if="loading"
                indeterminate
                color="secondary"
                @click.stop="cancelRequestLocation"
              >
                <v-icon>mdi-close-circle</v-icon></v-progress-circular
              >
              <v-icon v-else>my_location</v-icon>
            </v-btn>
          </v-toolbar>
        </v-col>
      </v-row>

      <v-container>
        <v-row justify="center">
          <v-col cols="12" md="6">
            <VenueList :geo="geo" />
          </v-col>
        </v-row>
      </v-container>
    </v-img>
  </v-container>
</template>

<script>
import VenueList from "@/components/VenueList.vue";
import { mapState } from "vuex";
import axios from "axios";

export default {
  computed: mapState(["searchLocation"]),
  components: {
    VenueList
  },
  data() {
    return {
      searchField: "",
      loading: false,
      requestCancelled: false,
      requestedLocation: false,
      geo: {
        latitude: 52.37454030000001,
        longitude: 4.897975505617977
      },
      dialog: undefined
    };
  },
  watch: {
    searchField(newValue) {
      if (this.requestedLocation == true) {
        this.requestedLocation = false;
        return;
      }
      this.handleSearch(newValue);
    }
  },
  methods: {
    async requestLocation() {
      this.loading = true;
      this.requestCancelled = false;
      console.log("requesting current location");
      try {
        navigator.geolocation.getCurrentPosition(
          async res => {
            if (!res?.coords) {
              this.loading = false;
              return; // no coordinates from geolocation api web
            }

            const osmRes = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?lat=${res.coords.latitude}&lon=${res.coords.longitude}&format=json`
            );

            if (this.requestCancelled) {
              this.requestCancelled = false;
              return;
            }
            this.requestedLocation = true;
            this.searchField = osmRes?.data?.address?.postcode;
            this.$store.dispatch("setSearchLocation", this.searchField);
            this.geo = {
              latitude: res?.coords?.latitude,
              longitude: res?.coords?.longitude
            };
            this.loading = false;
          },
          error => {
            this.$store.dispatch("setSnackbar", {
              show: true,
              text: "Locatie bepaling niet mogelijk, vul handmatig in."
            });
            this.loading = false;
            console.error(error);
          }
        );
      } catch (error) {
        console.log("error with location " + error);
      }
    },
    async getCoordinates() {
      if (!this.searchField?.length) {
        this.$store.dispatch("setSnackbar", {
          show: true,
          text: "Vul eerst een locatie in."
        });
        return;
      }
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search/${this.searchField}?format=json&countrycodes=NL&limit=3`
      );
      if (res.data[0] === undefined) return; // TODO: fix with indicator on hot reloading

      this.geo = {
        latitude: res.data[0].lat,
        longitude: res.data[0].lon
      };
    },
    cancelRequestLocation() {
      this.loading = false;
      this.requestCancelled = true;
    },
    handleSearch(query) {
      if (!query?.length) return;

      if (this.timeout) clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        if (this.searchField == this.searchLocation) return;
        this.$store.dispatch("setSearchLocation", this.searchField);
        //search function
        this.getCoordinates();
      }, 300);
    },
    async declaredHealthy() {
      sessionStorage.setItem(
        "healthStatus",
        JSON.stringify({
          healthy: true,
          timestamp: Date.now()
        })
      );
      this.dialog = false;
    }
  },
  mounted() {
    if (this.searchLocation !== "") {
      this.searchField = this.searchLocation;
      return;
    }

    this.requestLocation();
  },
  updated() {
    let status = JSON.parse(sessionStorage.getItem("healthStatus"));
    const offset = 12 * 60 * 60 * 1000; // time in ms that is required to re request the users health (12 hour)
    if (Date.now() - status?.timestamp > offset) {
      this.dialog = true;
    }
  }
};
</script>
