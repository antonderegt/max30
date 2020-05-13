<template>
  <div>
    <div v-if="venue === null">No venue information...</div>
    <div v-else>
      <h3>{{ venue.name }}</h3>
      <p v-if="venue.location">
        {{ venue.location.city }}, {{ venue.location.street }}
      </p>
      <p>Capaciteit: {{ venue.capacity }}</p>
      <p>Aanwezig: {{ venue.present }}</p>
      <p>Wachtrij:</p>
      <p v-if="queue.length === 0">Geen wachtrij, kom snel!</p>
      <p v-else v-for="person in queue" :key="person.id">{{ person.name }}</p>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  computed: mapState(["venue", "queue"]),
  data() {
    return {
      id: ""
    };
  },
  methods: {
    getVenue() {
      this.$store
        .dispatch("bindVenue", this.id)
        .then(() => {
          this.$store.dispatch("bindQueue", this.id).catch(error => {
            alert("bindQueue: " + error);
          });
        })
        .catch(error => {
          alert("bindHoreca: " + error);
        });
    }
    // async addMessage() {
    //     await db.collection("test").add({
    //         name: "testname",
    //         date: Timestamp.fromDate(new Date()),
    //     })
    // }
  },
  created() {
    this.id = this.$route.params.id;
    this.getVenue();
  }
};
</script>
