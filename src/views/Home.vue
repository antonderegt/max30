<template>
  <v-container fluid class="pa-0" style="background-color:'red'">
    <v-parallax
      height="250"
      src="https://cdn.vuetifyjs.com/images/parallax/material.jpg"
    >
      <v-row align="center" justify="center">
        <v-col cols="12" class="text-center">
          <h1 class="display-1 font-weight-thin mb-4">
            <b> Plekkie laat zien waar plek is!</b>
          </h1>
          <h4 class="subheading"></h4>
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col cols="12" sm="6" md="4">
          <v-toolbar style="border-radius: .5rem" rounded dense>
            <v-text-field
              v-model="searchField"
              hide-details
              autofocus
              clearable
              placeholder="Plaatsnaam of postcode"
              prepend-icon="search"
              single-line
              :disabled="loading"
            ></v-text-field>

            <v-btn @click="requestLocation()" icon>
              <v-progress-circular
                v-if="loading"
                indeterminate
                color="primary"
              ></v-progress-circular>
              <v-icon v-else>my_location</v-icon>
            </v-btn>
          </v-toolbar>
        </v-col>
      </v-row>
    </v-parallax>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="6">
          <VenueList :geo="geo" />
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
import VenueList from "@/components/VenueList.vue";
import axios from "axios";

export default {
  name: "Home",
  components: {
    VenueList
  },
  data() {
    return {
      searchField: "",
      loading: false,
      requestedLocation: false,
      geo: {
        latitude: 52.37454030000001,
        longitude: 4.897975505617977
      }
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
            this.requestedLocation = true;
            this.searchField = osmRes?.data?.address?.postcode;
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
    handleSearch(query) {
      if (!query?.length) return;

      if (this.timeout) clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        //search function
        this.getCoordinates();
      }, 300);
    }
  },
  mounted() {
    this.requestLocation();
  }
};
</script>
