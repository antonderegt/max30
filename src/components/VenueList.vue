<template>
  <div class="hello">
    <Loading v-show="loading" />

    <v-list two-line subheader>
      <v-subheader>
        Zoveel plek is er bij bedrijven bij u in de buurt:
      </v-subheader>

      <v-list-item
        :to="'venue/' + venue.id"
        v-for="venue in venueList"
        :key="venue.id"
      >
        <v-list-item-content>
          <v-list-item-title>{{ venue.name }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ venue.location.address }} in
            {{ venue.location.city }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
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
