<template>
  <div class="hello">
    <h3>Selecteer locatie</h3>
    <div v-if="loading">Loading...</div>
    <div v-else v-for="location in venueList" :key="location.id">
      <router-link :to="'venue/' + location.id" x>{{
        location.name
      }}</router-link>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  computed: mapState(["venueList"]),
  data() {
    return {
      loading: false
    };
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
