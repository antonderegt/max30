<template>
  <Loading v-if="loadingVenue" />
  <div v-else>
    <div v-if="venue === null">No venue information...</div>
    <div v-else>
      <h3>{{ venue.name }}</h3>
      <p v-if="venue.location">
        {{ venue.location.city }}, {{ venue.location.street }}
      </p>
      <p>Capaciteit: {{ venue.capacity }}</p>
      <p>Aanwezig: {{ venue.present }}</p>
      <p>Wachtrij:</p>
      <Loading v-if="loadingQueue" />
      <div v-else>
        <p v-if="queue.length === 0">Geen wachtrij, kom snel!</p>
        <p v-else v-for="person in queue" :key="person.id">{{ person.name }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Loading from "@/components/Loading.vue";

export default {
  computed: mapState(["venue", "queue"]),
  data() {
    return {
      id: "",
      loadingVenue: false,
      loadingQueue: false
    };
  },
  methods: {
    getVenue() {
      this.loadingVenue = true;
      this.$store
        .dispatch("bindVenue", this.id)
        .then(() => {
          this.loadingVenue = false;
          this.loadingQueue = true;
          this.$store
            .dispatch("bindQueue", this.id)
            .then(() => {
              this.loadingQueue = false;
            })
            .catch(error => {
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
  components: {
    Loading
  },
  created() {
    this.id = this.$route.params.id;
    this.getVenue();
  }
};
</script>
