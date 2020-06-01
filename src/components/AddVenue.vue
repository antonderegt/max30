<template>
  <Loading v-if="loading" />
  <v-container v-else>
    <v-card width="400" class="mx-auto mt-5">
      <v-card-title>
        <h1 class="display-1">Plek</h1>
      </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" :lazy-validation="lazy">
          <v-text-field
            v-model="name"
            :rules="nameRules"
            label="Naam"
            prepend-icon="mdi-card-account-details-outline"
            required
          ></v-text-field>
          <v-textarea
            v-model="description"
            label="Beschrijving"
            prepend-icon="mdi-information-outline"
            auto-grow
          ></v-textarea>
          <v-text-field
            v-model="url"
            label="Website"
            prepend-icon="mdi-web"
          ></v-text-field>
          <v-text-field
            v-model="phone"
            label="Telefoon"
            prepend-icon="mdi-cellphone"
          ></v-text-field>
          <v-text-field
            v-model="address.postcode"
            :rules="postcodeRules"
            label="Postcode"
            prepend-icon="mdi-home"
            v-on:blur="fetchLocation()"
            required
          ></v-text-field>
          <v-text-field
            v-model="address.number"
            :rules="numberRules"
            label="Huisnummer"
            prepend-icon="mdi-numeric"
            v-on:blur="fetchLocation()"
            required
          ></v-text-field>
          <v-text-field
            v-model="address.street"
            label="Straat"
            prepend-icon="mdi-road"
            disabled
          ></v-text-field>
          <v-text-field
            v-model="address.city"
            label="Stad"
            prepend-icon="mdi-city"
            disabled
          ></v-text-field>

          <!-- TODO: add category -->

          <v-divider></v-divider>
          <v-slider
            :label="'Capaciteit: ' + capacity"
            v-model="capacity"
            thumb-label
          ></v-slider>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn color="info" @click="addVenue">Toevoegen</v-btn>
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
      description: "",
      nameRules: [v => !!v || "Veld is verplicht"],
      phone: "",
      url: "",
      urlRules: [v => !!v || "Veld is verplicht"],
      postcodeRules: [
        v => !!v || "Postcode is verplicht",
        v =>
          /^[1-9][0-9]{3} ?(?!sa|sd|ss)[a-z]{2}$/i.test(v) ||
          "Voer een geldig postcode in"
      ],
      numberRules: [v => !!v || "Huisnummer is verplicht"],
      address: {
        postcode: "",
        number: "",
        street: ""
      },
      capacity: 30
    };
  },
  methods: {
    async addVenue() {
      this.loading = true;
      if (!this.$refs.form.validate()) {
        console.log("Error with validation of form");
        return;
      }
      const query =
        this.address.street +
        " " +
        this.address.number +
        ", " +
        this.address.city;
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
        description: this.description,
        phone: this.phone,
        url: this.url,
        location: {
          city: this.address.city,
          address: `${this.address.street} ${this.address.number}`,
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
    },
    async fetchLocation() {
      if (this.address.postcode.length && this.address.number.length) {
        try {
          const res = await axios.get(
            `https://api.postcodedata.nl/v1/postcode/?postcode=${this.address.postcode}&streetnumber=${this.address.number}&ref=domeinnaam.nl&type=json`
          );
          if (res.data.status === "ok") {
            this.address = { ...this.address, ...res.data.details[0] };
          } else {
            this.address.street = "Kan geen geldige locatie vinden";
          }
        } catch (error) {
          console.log("fetchLocation: " + error);
        }
      }
    }
  },
  components: { Loading }
};
</script>
