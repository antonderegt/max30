<template>
  <v-container grid-list-xl>
    <v-layout row wrap justify-center>
      <v-flex xs12>
        <h1>Welcome to the waiting room</h1>
      </v-flex>
      <Loading v-if="loading" />
      <v-flex v-else xs12 md6>
        {{ user.profile.name }} your wait list status is:
        <span class="font-weight-bold text-uppercase">{{
          waitListItem.status
        }}</span>
      </v-flex>
      <v-flex>
        <v-text-field v-model="message"></v-text-field>
        <v-btn @click="sendMessage">Send message to venue</v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from "vuex";
import firebase from "firebase/app";
import Loading from "@/components/Loading.vue";

export default {
  computed: mapState(["user", "waitListItem"]),
  data() {
    return {
      loading: true,
      message: ""
    };
  },
  methods: {
    sendMessage() {
      alert("I'm not sending this offensive message: " + this.message);
    },
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
  components: { Loading },
  async created() {
    await firebase.getCurrentUser();
    await this.$store.dispatch("fetchProfile", this.user.data.uid);
    this.loadWaitListStatus();
  }
};
</script>
