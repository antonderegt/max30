<template>
  <v-container>
    You're in the waitingroom
    <span v-if="!loading">{{ user.profile.name }}</span
    >!
    <p>
      Your wait list status:
      <span v-if="!loading">{{ waitListItem.status }}</span>
    </p>
    <v-btn @click="loadWaitListStatus">Load status</v-btn>
  </v-container>
</template>

<script>
import { mapState } from "vuex";

export default {
  computed: mapState(["user", "waitListItem"]),
  data() {
    return {
      loading: true
    };
  },
  methods: {
    async loadWaitListStatus() {
      this.loading = true;
      const waitListItem = {
        venue: this.user.profile.waitingFor,
        user: this.user.data.uid
      };
      try {
        await this.$store.dispatch("bindSingleWaitListItem", waitListItem);
        this.loading = false;
      } catch (error) {
        alert("SingleWaitListItem: " + error);
      }
    }
  },
  async created() {
    // @TODO: wait for profile data to load before loading waitlist item
    // Error on refresh of page: "TypeError: Cannot read property 'uid' of null"
    await this.$store.dispatch("fetchProfile", this.user.data.uid);
    this.loadWaitListStatus();
  }
};
</script>
