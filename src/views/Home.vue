<template>
  <div>
        <v-parallax
    height="300"
    src="https://images.unsplash.com/photo-1513151233558-d860c5398176?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
  ></v-parallax>
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
