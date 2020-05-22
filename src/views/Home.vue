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
            hide-details
            prepend-icon="search"
            single-line
          ></v-text-field>

          <v-btn icon>
            <v-icon>my_location</v-icon>
          </v-btn>
        </v-toolbar>
      </v-layout>
    </v-parallax>
    <v-container class="my-5">
      <v-row justify="center" class="pa-3">
        <v-col cols="12" md="6">
          <VenueList />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import VenueList from "@/components/VenueList.vue";

export default {
  name: "Home",
  components: {
    VenueList
  }
};
</script>

<style scoped>
.v-parallax {
  background-color: #54bfeb;
}
</style>
