<template>
  <Loading v-if="loading" />
  <v-list v-else subheader two-line class="pa-3">
    <v-list-item
      v-for="venue in myVenues"
      :key="venue.name"
      @click="goToVenue(venue.id)"
    >
      <v-list-item-content>
        <v-list-item-title>{{ venue.name }} </v-list-item-title>
        <v-list-item-action>
          <v-spacer></v-spacer>
          <v-btn color="error" @click.stop="deleteVenue(venue.id)"
            >delete</v-btn
          >
        </v-list-item-action>
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
    },
    deleteVenue(id) {
      console.log(id);
      console.log(this.user.data.uid);
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
