<template>
  <div class="hello">
    <h3>Selecteer locatie</h3>
    <Loading v-if="loading" />
    <div v-else v-for="location in venueList" :key="location.id">
      <router-link :to="'venue/' + location.id" x>{{
        location.name
      }}</router-link>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Loading from "@/components/Loading.vue";
export default {
  computed: mapState(["venueList"]),
  data() {
    return {
      loading: false
    };
  },
  components: {
    Loading
  },
  methods: {
    getVenueList() {
      this.loading = true;
      this.$store
        .dispatch("bindVenueList")
        .then(() => {
          this.loading = false;
        })
        .catch(error => {
          alert("bindLocations: " + error);
        });
    }
  },
  created() {
    this.getVenueList();
  }
};
</script>
