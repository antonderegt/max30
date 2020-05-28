<template>
  <Loading v-if="loading" />
  <v-container v-else>
    <v-card width="400" class="mx-auto mt-5">
      <v-card-title>
        <h1 class="display-1">Add Venue</h1>
      </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" :lazy-validation="lazy">
          <v-text-field
            v-model="name"
            :rules="nameRules"
            label="Name"
            prepend-icon="mdi-account"
            required
          ></v-text-field>
          <v-text-field
            v-model="city"
            :rules="nameRules"
            label="City"
            prepend-icon="mdi-account"
            required
          ></v-text-field>
          <v-text-field
            @keyup.enter="addVenue"
            v-model="address"
            :rules="nameRules"
            label="Address"
            prepend-icon="mdi-account"
            required
          ></v-text-field>
          <!-- TODO: add category -->

          <v-divider></v-divider>
          <v-slider
            :label="'Capacity: ' + capacity"
            v-model="capacity"
            thumb-label
          ></v-slider>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn color="info" @click="addVenue">Add</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import firebase from "firebase/app";
import { mapState } from "vuex";
import Loading from "@/components/Loading.vue";
import axios from "axios";

export default {
  computed: mapState(["user"]),
  data() {
    return {
      loading: false,
      valid: true,
      lazy: true,
      name: "",
      city: "",
      address: "",
      nameRules: [v => !!v || "Field is required"],
      capacity: 30
    };
  },
  methods: {
    async addVenue() {
      this.loading = true;
      if (this.$refs.form.validate()) {
        const query = this.address + ", " + this.city;
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/search/${query}?format=json&countrycodes=NL&limit=3`
        );
        const coords = new firebase.firestore.GeoPoint(
          parseFloat(res.data[0].lat),
          parseFloat(res.data[0].lon)
        );
        this.geo = coords;
        const venue = {
          name: this.name,
          location: {
            city: this.city,
            address: this.address,
            geo: coords
          },
          owners: {
            [this.user.data.uid]: true
          },
          category: {
            bar: true
          },
          capacity: this.capacity,
          presentCount: 0
        };
        await this.$store.dispatch("addVenue", venue);
        this.$router.push("/my-venues");
        this.loading = false;
      }
    }
  },
  components: { Loading }
};
</script>
