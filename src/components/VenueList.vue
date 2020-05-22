<template>
  <div class="hello">
    <Loading v-show="loading" />

    <v-list two-line subheader>
      <!-- <v-list-item
        :to="'venue/' + venue.id"
        v-for="venue in venueList"
        :key="venue.id"
      >
        <v-list-item-content>
          <v-list-item-title>{{ venue.name }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ venue.location.address }}<br />
            {{ venue.location.postcode }} in {{ venue.location.city }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item> -->
      <!-- TODO: hadere restaruants: in Zwolle (postcode) -->
      <v-row>
        <v-col
          :to="'venue/' + venue.id"
          v-for="venue in venueList"
          :key="venue.id"
          cols="12"
        >
          <v-card class="mx-auto" max-width="700" outlined>
            <v-list-item three-line>
              <v-list-item-content>
                <v-list-item-title class="headline mb-1">{{
                  venue.name
                }}</v-list-item-title>
                <v-list-item-subtitle>{{
                  venue.location.address
                }}</v-list-item-subtitle>
                <v-list-item-subtitle>{{
                  venue.location.city
                }}</v-list-item-subtitle>
              </v-list-item-content>
              <!-- 
              <v-list-item-avatar
                tile
                size="80"
                color="grey"
              ></v-list-item-avatar> -->
              <v-card-actions v-if="venue.capacity === venue.present">
                <v-btn
                  :to="'venue/' + venue.id"
                  class="ma-2"
                  tile
                  outlined
                  color="success"
                >
                  <v-icon left>post_add</v-icon> Zet mij in de wachtrij
                </v-btn>
              </v-card-actions>
            </v-list-item>

            <v-card-actions>
              <!-- <v-btn text>Button</v-btn> -->
              <v-progress-linear
                xs12
                :v-model="(venue.present / venue.capacity) * 100"
                height="25"
                :color="getProgressColor(venue)"
                reactive
              >
                <strong>{{ venue.present }} / {{ venue.capacity }}</strong>
              </v-progress-linear>
              <v-list-item-subtitle
                v-if="venue.waitlist && venue.waitlist.length > 0"
              >
                Er staan <b>{{ venue.waitlist.length }}</b> mensen in de
                wachtrij
              </v-list-item-subtitle>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-list>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Loading from "@/components/Loading.vue";
export default {
  props: {
    filter: {
      type: String,
      default: ""
    }
  },
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
    async getVenueList() {
      this.loading = true;
      try {
        await this.$store.dispatch("bindVenueList");
        this.loading = false;
      } catch (error) {
        alert("bindLocations: " + error);
      }
    },
    getProgressColor(venue) {
      let progess = (venue.present / venue.capacity) * 100;
      if (progess < 80) return "green";
      if (progess < 99) return "orange";
      return "red";
    }
  },
  created() {
    this.getVenueList();
  }
};
</script>
