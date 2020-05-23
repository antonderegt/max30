<template>
  <Loading v-if="loading" />
  <v-container v-else class="pa-3">
    <v-card
      v-for="venue in myVenues"
      :key="venue.name"
      @click="goToVenue(venue.id)"
      class="ma-3"
    >
      <v-card-title>
        {{ venue.name }}
      </v-card-title>
    </v-card>
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
