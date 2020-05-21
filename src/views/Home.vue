<template>
  <div>
    <v-parallax
      height="300"
      src="https://images.unsplash.com/photo-1513151233558-d860c5398176?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
    >
      <v-row align="center" justify="center" no-gutters>
        <v-col xs12 class="text-center">
          <h1 class="display-1 font-weight-thin mb-4">Plekkie</h1>
          <h4 class="subheading">
            Lekker weer open! Makkelijk beheren dat je 30 mensen binnen hebt met
            30max.nl
          </h4>
        </v-col>
      </v-row>

      <v-row justify="center" no-gutters>
        <v-col cols="12" md="2" class="text-center">
          <v-btn rounded color="#3581C1" dark>
            Ik wil ergens naartoe
          </v-btn>
        </v-col>
        <v-col cols="12" md="2" offset-md="1" class="text-center">
          <v-btn to="/register-venue" rounded color="#3581C1" dark>
            Meld je bedrijf aan
          </v-btn>
        </v-col>
      </v-row>
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
