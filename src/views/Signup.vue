<template>
  <v-container>
    <v-card width="400" class="mx-auto mt-5 pb-1">
      <v-card-title>
        <h1 class="display-1" v-if="owner">Meld hier je bedrijf aan</h1>
        <h1 class="display-1" v-else>Meld je aan</h1>
      </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" :lazy-validation="lazy">
          <v-radio-group v-model="owner" label="Wie ben je?" required>
            <v-radio label="Ondernemer" :value="true"></v-radio>
            <v-radio label="Bezoeker" :value="false"></v-radio>
          </v-radio-group>
          <v-text-field
            v-model="name"
            :rules="nameRules"
            label="Naam"
            prepend-icon="mdi-account"
            required
          ></v-text-field>
          <v-text-field
            v-model="email"
            :rules="emailRules"
            label="Email"
            prepend-icon="mdi-email"
            required
          ></v-text-field>
          <v-text-field
            v-if="owner"
            v-model="address.postcode"
            label="Postcode"
            prepend-icon="mdi-house"
            v-on:blur="fetchLocation()"
            required
            :rules="postcodeRule"
          ></v-text-field>
          <v-text-field
            v-if="owner"
            v-model="address.number"
            label="Huisnummer"
            prepend-icon="mdi-house"
            v-on:blur="fetchLocation()"
            required
          ></v-text-field>
          <v-text-field
            v-if="owner"
            v-model="address.street"
            label="Straat"
            prepend-icon="mdi-house"
            disabled
          ></v-text-field>
          <v-text-field
            v-if="owner"
            v-model="address.city"
            label="Stad"
            prepend-icon="mdi-house"
            disabled
          ></v-text-field>
          <v-text-field
            v-model="password"
            :rules="passwordRules"
            label="Wachtwoord"
            :type="showPassword ? 'text' : 'password'"
            prepend-icon="mdi-lock"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="showPassword = !showPassword"
            required
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-row class="ma-3">
        <v-btn color="info" ma-5 @click="signUp"
          >Laat de klanten maar komen!</v-btn
        >
      </v-row>
      <v-row class="ma-3">
        <v-btn text small to="/login">Ik heb al een account</v-btn>
      </v-row>
    </v-card>
  </v-container>
</template>

<script>
import firebase from "firebase/app";
import { mapGetters } from "vuex";
import axios from "axios";

export default {
  props: ["isVenue"],
  name: "signup",
  computed: {
    ...mapGetters({
      user: "user"
    })
  },
  data() {
    return {
      valid: true,
      lazy: true,
      name: "",
      nameRules: [v => !!v || "Name is required"],
      email: "",
      emailRules: [
        v => !!v || "E-mail is required",
        v => /.+@.+\..+/.test(v) || "E-mail must be valid"
      ],
      postcodeRule: [
        v => !!v || "Postcode is verplicht",
        v =>
          /^[1-9][0-9]{3} ?(?!sa|sd|ss)[a-z]{2}$/i.test(v) ||
          "Voer een geldig postcode in"
      ],
      address: {
        postcode: "",
        number: "",
        street: ""
      },
      password: "",
      passwordRules: [
        v => !!v || "Password is required",
        v => (v && v.length >= 6) || "Password must be at least 6 characters"
      ],
      showPassword: false,
      owner: this.isVenue
    };
  },
  methods: {
    async fetchLocation() {
      if (this.address.postcode.length && this.address.number.length) {
        console.log(this.address);
        const res = await axios.get(
          `http://api.postcodedata.nl/v1/postcode/?postcode=${this.address.postcode}&streetnumber=${this.address.number}&ref=domeinnaam.nl&type=json`
        );
        console.log(res);
        if (res.data.status === "ok") {
          this.address = { ...this.address, ...res.data.details[0] };
          console.log(this.address);
        }
      }
    },
    async signUp() {
      if (this.$refs.form.validate()) {
        try {
          const res = await firebase
            .auth()
            .createUserWithEmailAndPassword(this.email, this.password);
          const profile = {
            id: res.user.uid,
            name: this.name,
            owner: this.owner
          };
          this.$store.dispatch("createProfile", profile);
          this.$router.replace("/login");
        } catch (error) {
          alert(error.message);
        }
      }
    }
  }
};
</script>
