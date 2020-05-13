<template>
  <div class="hello">
    <h3>Selecteer locatie</h3>
    <div v-for="location in venueList" :key="location.id">
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
  methods: {
    getVenueList() {
      this.$store.dispatch("bindVenueList").catch(error => {
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
