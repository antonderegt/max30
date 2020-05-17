<template>
  <v-container>
    You're in the waitingroom {{ user.profile.name }}!
    <p>Your wait list status: {{ waitListItem.status }}</p>
    <v-btn @click="loadWaitListStatus">Load status</v-btn>
  </v-container>
</template>

<script>
import { mapState } from "vuex";

export default {
  computed: mapState(["user", "waitListItem"]),
  methods: {
    loadWaitListStatus() {
      const waitListItem = {
        venue: this.user.profile.waitingFor,
        user: this.user.data.uid
      };
      this.$store
        .dispatch("bindSingleWaitListItem", waitListItem)
        .then(() => {
          console.log("loaded");
          console.log(this.waitListItem);
        })
        .catch(error => {
          alert("SingleWaitListItem: " + error);
        });
    }
  },
  created() {
    this.loadWaitListStatus();
    console.log(this.waitListItem);
  }
};
</script>
