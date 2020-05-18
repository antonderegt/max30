<template>
  <Loading v-if="loading" />
  <v-list v-else subheader two-line>
    <v-list-item
      v-for="venue in myVenues"
      :key="venue.name"
      @click="goToVenue(venue.id)"
    >
      <v-list-item-content>
        <v-list-item-title>{{ venue.name }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </v-list>
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
    }
  },
  components: { Loading },
  created() {
    this.getMyVenues();
  }
};
</script>
