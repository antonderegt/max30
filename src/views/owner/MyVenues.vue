<template>
  <Loading v-if="loading" />
  <v-container v-else class="pa-3">
    <v-card v-if="myVenues.length === 0">
      <v-card-title>You don't have any venues registered</v-card-title>
      <v-card-actions>
        <v-btn to="/add-venue">Click here to register</v-btn>
      </v-card-actions>
    </v-card>
    <v-card
      v-else
      v-for="venue in myVenues"
      :key="venue.name"
      @click="goToVenue(venue.id)"
      class="ma-3"
    >
      <v-card-title>
        {{ venue.name }}
      </v-card-title>
    </v-card>
    <v-btn
      to="/add-venue"
      color="pink"
      class="ma-10"
      dark
      absolute
      bottom
      right
      fab
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>
  </v-container>
</template>

<script>
import firebase from "firebase/app";
import { mapState } from "vuex";
import Loading from "@/components/Loading.vue";

export default {
  computed: mapState(["user", "myVenues"]),
  data() {
    return {
      loading: false
    };
  },
  methods: {
    getMyVenues() {
      this.loading = true;
      firebase.auth().onAuthStateChanged(async user => {
        if (user) {
          try {
            await this.$store.dispatch("bindMyVenues", user.uid);
          } catch (error) {
            alert("bindMyVenues: " + error);
          }
          this.loading = false;
        }
      });
    },
    goToVenue(id) {
      this.$router.push(`/my-venue/${id}`);
    }
  },
  components: { Loading },
  created() {
    this.getMyVenues();
  }
};
</script>
