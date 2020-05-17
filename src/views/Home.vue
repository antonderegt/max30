<template>
  <div>
    <!-- <v-parallax
      height="300"
      src="https://images.unsplash.com/photo-1513151233558-d860c5398176?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
    ></v-parallax> -->
    <v-parallax
      height="300"
      src="https://images.unsplash.com/photo-1513151233558-d860c5398176?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
    >
      <v-row align="center" justify="center">
        <v-col class="text-center" cols="12">
          <h1 class="display-1 font-weight-thin mb-4">Max 30</h1>
          <h4 class="subheading">
            Lekker weer open! Makkelijk beheren dat je 30 mensen binnen hebt met
            30max.nl
          </h4>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="text-center" cols="6">
          <div class="text-right">
            <v-btn rounded color="#3581C1" dark>Meld je bedrijf aan</v-btn>
          </div>
        </v-col>
        <v-col class="text-center" cols="6">
          <div class="text-left">
            <v-btn rounded color="#3581C1" dark>Ik wil ergens naartoe</v-btn>
          </div>
        </v-col>
      </v-row>
    </v-parallax>
    <v-container class="my-5">
      <v-layout row wrap justify-center class="pa-3">
        <v-flex xs12 md6>
          <VenueList />
        </v-flex>
      </v-layout>
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
