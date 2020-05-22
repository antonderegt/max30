<template>
  <div style="background-color:'red'">
    <v-parallax border="0" height="300">
      <v-layout align-center justify-center>
        <v-flex xs12 class="text-center">
          <h1 class="display-1 font-weight-thin mb-4">
            Geen zin om in de wachtrij te staan? <br /><br />
            <b> Op Plekkie zie je waar genoeg plek is!</b>
          </h1>
          <h4 class="subheading"></h4>
        </v-flex>
      </v-layout>

      <v-layout row justify-center>
        <v-toolbar class="mx-auto" max-width="700">
          <v-text-field
            v-model="searchField"
            hide-details
            prepend-icon="search"
            single-line
          ></v-text-field>

          <v-btn @click="requestLocation()" icon>
            <v-icon>my_location</v-icon>
          </v-btn>
        </v-toolbar>
      </v-layout>
    </v-parallax>
    <v-container class="my-5">
      <v-row justify="center" class="pa-3">
        <v-col cols="12" md="6">
          <VenueList :filter="searchField" />
        </v-col>
      </v-row>
    </v-container>
  </div>
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
      address: ""
    };
  },
  watch: {
    searchField(newValue) {
      console.log(newValue);
    }
  },
  methods: {
    async requestLocation() {
      navigator.geolocation.getCurrentPosition(
        async res => {
          console.log(res);
          const osmRes = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${res.coords.latitude}&lon=${res.coords.longitude}&format=json`
          );
          this.address = osmRes.data.address;
          this.searchField = osmRes.data.address.postcode;
        },
        e => {
          alert(e);
        }
      );
    }
  }
};
</script>

<style scoped>
.v-parallax {
  background-color: #54bfeb;
}
</style>
