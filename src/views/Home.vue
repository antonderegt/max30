<template>
  <v-container fluid class="pa-0" style="background-color:'red'">
    <v-parallax
      height="350"
      src="https://cdn.vuetifyjs.com/images/parallax/material.jpg"
    >
      <v-row align="center" justify="center">
        <v-col cols="12" class="text-center">
          <h1 class="display-1 font-weight-thin mb-4">
            Geen zin om in de wachtrij te staan? <br /><br />
            <b> Op Plekkie zie je waar genoeg plek is!</b>
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
            ></v-text-field>

            <v-btn @click="requestLocation()" icon>
              <v-icon>my_location</v-icon>
            </v-btn>
          </v-toolbar>
        </v-col>
      </v-row>
    </v-parallax>
    <v-container class="my-5">
      <v-row justify="center" class="pa-3">
        <v-col cols="12" md="6">
          <VenueList :filter="searchField" />
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
  mounted() {
    this.requestLocation();
  },
  data() {
    return {
      searchField: "",
      address: "",
      suggestions: [],
      isLoading: false
    };
  },
  watch: {
    async searchField(newValue) {
      await this.autoCompleteInput(newValue);
    }
  },
  methods: {
    async requestLocation() {
      console.log("requesting");
      navigator.geolocation.getCurrentPosition(
        async res => {
          const osmRes = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${res.coords.latitude}&lon=${res.coords.longitude}&format=json`
          );
          this.address = osmRes?.data?.address;
          this.searchField = osmRes?.data?.address?.postcode;
        },
        e => {
          console.error(e);
        }
      );
    },
    async autoCompleteInput(query) {
      this.isLoading = true;
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search/${query}?format=json&countrycodes=NL&limit=3`
      );
      this.suggestions = res?.data.map(el => el?.display_name); // TODO for Tom: get lat, lon and calculate distance to venue with Geocoding api
      this.suggestions = res.data;
      console.log(this.suggestions);
      this.isLoading = false;
    }
  }
};
</script>
