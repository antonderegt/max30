<template>
  <div>
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
