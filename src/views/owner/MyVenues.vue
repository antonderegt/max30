<template>
  <v-row justify-ceneter>
    <Loading v-if="loading" />
    <v-flex v-for="venue in myVenues" :key="venue.name">
      {{ venue.name }}
      <v-btn outlined block @click="getMyVenues">Show venue</v-btn>
    </v-flex>
  </v-row>
</template>

<script>
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
      this.$store.dispatch("bindMyVenues", this.user.data.uid).then(() => {
        this.loading = false;
      });
    }
  },
  components: { Loading },
  mounted() {
    this.getMyVenues();
  }
};
</script>
