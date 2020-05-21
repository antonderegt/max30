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
      firebase.auth().onAuthStateChanged(async user => {
        if (user) {
          await this.$store.dispatch("bindMyVenues", user.uid);
          this.loading = false;
        }
      });
    },
    goToVenue(id) {
      this.$router.push(`/my-venue/${id}`);
    },
    editVenue(id) {
      console.log(id);
      this.$router.push(`/edit-venue/${id}`);

      alert("Jeroen bouw dit ff in.");
    },
    deleteVenue(id) {
      const venue = {
        venue: id,
        user: this.user.data.uid
      };
      this.$store.dispatch("deleteVenue", venue);
    }
  },
  components: { Loading },
  created() {
    this.getMyVenues();
  }
};
</script>
