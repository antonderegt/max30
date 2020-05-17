<template>
  <v-row justify-ceneter>
    <Loading v-if="loading" />
    <v-flex v-for="venue in myVenues" :key="venue.name">
      {{ venue.name }}
      <v-btn outlined block @click="goToVenue(venue.id)">Show venue</v-btn>
    </v-flex>
  </v-row>
</template>

<script>
import firebase from "firebase/app";
import { mapGetters } from "vuex";
import Loading from "@/components/Loading.vue";

export default {
  computed: {
    ...mapGetters({
      user: "user",
      myVenues: "myVenues"
    })
  },
  data() {
    return {
      loading: false
    };
  },
  methods: {
    getMyVenues() {
      this.loading = true;
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          this.$store.dispatch("bindMyVenues", user.uid).then(() => {
            this.loading = false;
          });
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
