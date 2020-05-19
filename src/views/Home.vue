<template>
  <div>
    <v-parallax
      height="300"
      src="https://images.unsplash.com/photo-1513151233558-d860c5398176?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
    >
      <v-layout align-center justify-center>
        <v-flex xs12 class="text-center">
          <h1 class="display-1 font-weight-thin mb-4">Max 30</h1>
          <h4 class="subheading">
            Lekker weer open! Makkelijk beheren dat je 30 mensen binnen hebt met
            30max.nl
          </h4>
        </v-flex>
      </v-layout>

      <v-layout row wrap justify-center>
        <v-flex xs12 md2 class="text-center">
          <v-btn rounded color="#3581C1" dark>
            Ik wil ergens naartoe
          </v-btn>
        </v-flex>
        <v-flex xs12 md2 offset-md1 class="text-center">
          <v-btn to="/register-venue" rounded color="#3581C1" dark>
            Meld je bedrijf aan
          </v-btn>
        </v-flex>
      </v-layout>
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
