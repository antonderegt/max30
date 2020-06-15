<template>
  <v-form ref="form" lazy-validation>
    <v-text-field
      v-model="name"
      :rules="rules.nameRules"
      label="Naam plekkie"
      prepend-icon="mdi-card-account-details-outline"
      required
    ></v-text-field>
    <v-textarea
      v-if="allFields"
      v-model="description"
      label="Beschrijving"
      prepend-icon="mdi-information-outline"
      auto-grow
    ></v-textarea>
    <v-text-field
      v-if="allFields"
      v-model="url"
      label="Website"
      prepend-icon="mdi-web"
    ></v-text-field>
    <v-text-field
      v-if="allFields"
      v-model="phone"
      label="Telefoon"
      prepend-icon="mdi-cellphone"
    ></v-text-field>
    <v-text-field
      v-model="address.postcode"
      :rules="rules.postcodeRules"
      label="Postcode"
      prepend-icon="mdi-home"
      v-on:blur="fetchLocation()"
      required
    ></v-text-field>
    <v-row no-gutters>
      <v-col cols="6">
        <v-text-field
          v-model="address.number"
          :rules="rules.numberRules"
          label="Huisnummer"
          prepend-icon="mdi-numeric"
          v-on:blur="fetchLocation()"
          required
        ></v-text-field> </v-col
      ><v-col cols="6">
        <v-text-field
          v-model="address.addition"
          label="Toevoeging"
          prepend-icon="mdi-alphabetical"
          v-on:blur="fetchLocation()"
          required
        ></v-text-field>
      </v-col>
    </v-row>
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

    <br />
    <span>Capaciteit</span>
    <v-slider v-model="capacity" thumb-label="always">
      <template v-slot:prepend>
        <v-icon @click="capacity--">
          mdi-minus
        </v-icon>
      </template>

      <template v-slot:append>
        <v-icon @click="capacity++">
          mdi-plus
        </v-icon>
      </template>
    </v-slider>
  </v-form>
</template>

<script>
import firebase from "firebase/app";
import { mapState } from "vuex";
import axios from "axios";

export default {
  props: {
    allFields: {
      type: Boolean,
      default: false
    }
  },
  computed: mapState(["user", "rules"]),
  data() {
    return {
      name: "",
      description: "",
      phone: "",
      url: "",
      address: {
        postcode: "",
        number: "",
        addition: "",
        street: ""
      },
      capacity: 30
    };
  },
  methods: {
    async addVenue() {
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
          address: `${this.address.street + " " + this.address.number}${
            this.address.addition
              ? isNaN(this.address.addition)
                ? this.address.addition
                : "-" + this.address.addition
              : ""
          }`,
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
      this.$router.push(this.$route.query.redirect || "/my-venues");
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
  }
};
</script>
