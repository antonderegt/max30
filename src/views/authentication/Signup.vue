<template>
  <v-container>
    <Loading v-if="loading" />
    <v-card width="400" class="mx-auto mt-5 pb-1">
      <v-card-title>
        <h1 class="display-1" v-if="owner">Meld hier je bedrijf aan</h1>
        <h1 class="display-1" v-else>Meld je aan</h1>
      </v-card-title>
      <v-card-text v-if="method === ''">
        <v-row>
          <v-col>
            Selecteer hoe je je wilt aanmelden
          </v-col>
        </v-row>
        <v-row justify="center" class="pa-2">
          <v-btn
            @click="method = 'google'"
            color="#4285F4"
            class="ma-2 white--text"
            block
          >
            <v-icon color="white" class="mr-2">fab fa-google</v-icon>
            Google</v-btn
          >
          <v-btn
            @click="method = 'facebook'"
            color="#4267B2"
            class="ma-2 white--text"
            block
          >
            <v-icon color="white" class="mr-2">fab fa-facebook</v-icon>
            Facebook</v-btn
          >
          <v-btn
            @click="method = 'email'"
            color="#211F1F"
            class="ma-2 white--text"
            block
          >
            <v-icon color="white" class="mr-2">mdi-email</v-icon>
            Email</v-btn
          >
        </v-row>
      </v-card-text>
      <v-card-text v-if="method !== ''">
        <v-form ref="form" v-model="valid" :lazy-validation="lazy">
          <v-radio-group v-model="owner" label="Wie ben je?" required>
            <v-radio label="Ondernemer" :value="true"></v-radio>
            <v-radio label="Bezoeker" :value="false"></v-radio>
          </v-radio-group>
          <v-text-field
            v-if="method === 'email'"
            v-model="name"
            :rules="nameRules"
            label="Naam"
            prepend-icon="mdi-account"
            required
          ></v-text-field>
          <v-text-field
            v-if="method === 'email'"
            v-model="email"
            :rules="emailRules"
            label="Email"
            prepend-icon="mdi-email"
            required
          ></v-text-field>
          <v-text-field
            v-if="method === 'email'"
            v-model="password"
            :rules="passwordRules"
            label="Wachtwoord"
            :type="showPassword ? 'text' : 'password'"
            prepend-icon="mdi-lock"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="showPassword = !showPassword"
            required
          ></v-text-field>
          <span v-if="owner">Vul de gegevens in van je eerste zaak</span>
          <v-text-field
            v-if="owner"
            v-model="venue.name"
            :rules="nameRules"
            label="Naam"
            prepend-icon="mdi-card-account-details"
            required
          ></v-text-field>
          <v-text-field
            v-if="owner"
            v-model="venue.address.postcode"
            :rules="postcodeRules"
            label="Postcode"
            prepend-icon="mdi-home"
            v-on:blur="fetchLocation()"
            required
          ></v-text-field>
          <v-text-field
            v-if="owner"
            v-model="venue.address.number"
            :rules="numberRules"
            label="Huisnummer"
            prepend-icon="mdi-numeric"
            v-on:blur="fetchLocation()"
            required
          ></v-text-field>
          <v-text-field
            v-if="owner"
            v-model="venue.address.street"
            label="Straat"
            prepend-icon="mdi-road"
            disabled
          ></v-text-field>
          <v-text-field
            v-if="owner"
            v-model="venue.address.city"
            label="Stad"
            prepend-icon="mdi-city"
            disabled
          ></v-text-field>
          <br />
          <span v-if="owner">Capaciteit</span>
          <v-slider v-if="owner" v-model="capacity" thumb-label="always">
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
      </v-card-text>
      <v-divider></v-divider>
      <v-row class="ma-2" v-if="method !== ''">
        <v-btn
          v-if="owner"
          color="secondary"
          class="dark--text"
          ma-5
          @click="signUp"
          >Laat de klanten maar komen!</v-btn
        ><v-btn v-else color="secondary" class="dark--text" ma-5 @click="signUp"
          >Meld mij aan!</v-btn
        >
      </v-row>
      <v-row class="ma-2">
        <v-btn text to="/login">Ik heb al een account</v-btn>
      </v-row>
    </v-card>
  </v-container>
</template>

<script>
import firebase from "firebase/app";
import { mapGetters } from "vuex";
import axios from "axios";
import Loading from "@/components/Loading.vue";

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
      loading: false,
      method: "",
      valid: true,
      lazy: true,
      name: "",
      nameRules: [v => !!v || "Naam is verplicht"],
      email: "",
      emailRules: [
        v => !!v || "E-mail is verplicht",
        v => /.+@.+\..+/.test(v) || "E-mail moet geldig zijn"
      ],
      postcodeRules: [
        v => !!v || "Postcode is verplicht",
        v =>
          /^[1-9][0-9]{3} ?(?!sa|sd|ss)[a-z]{2}$/i.test(v) ||
          "Voer een geldig postcode in"
      ],
      numberRules: [v => !!v || "Huisnummer is verplicht"],
      venue: {
        name: "",
        address: {
          postcode: "",
          number: "",
          street: ""
        }
      },
      password: "",
      passwordRules: [
        v => !!v || "Wachtwoord is verplicht",
        v =>
          (v && v.length >= 6) || "Wachtwoord moet minstens 6 characters zijn"
      ],
      showPassword: false,
      capacity: 30,
      owner: this.isVenue
    };
  },
  methods: {
    async signupWithSocial(provider) {
      if (!this.$refs.form.validate()) return;

      this.loading = true;
      switch (provider) {
        case "google":
          provider = new firebase.auth.GoogleAuthProvider();
          break;
        case "facebook":
          provider = new firebase.auth.FacebookAuthProvider();
          break;
      }
      try {
        const result = await firebase.auth().signInWithPopup(provider);
        const hasProfile = await this.$store.dispatch(
          "fetchProfile",
          result.user.uid
        );
        if (!hasProfile) {
          const profile = {
            id: result.user.uid,
            name: result.user.displayName,
            owner: this.owner
          };
          await this.$store.dispatch("createProfile", profile);
        }
        if (!this.owner) {
          this.$router.push(this.$route.query.redirect || "/");
          this.loading = false;
          return;
        }
        await this.addVenue(result.user.uid);
        this.$router.push(this.$route.query.redirect || "/my-venues");
        this.loading = false;
      } catch (error) {
        console.log("signInWithSocial: " + error);
      }
    },
    async addVenue(uid) {
      if (!this?.$refs?.form?.validate()) {
        console.log("Error with validation of form");
        return;
      }
      const query =
        this.venue.address.street +
        " " +
        this.venue.address.number +
        ", " +
        this.venue.address.city;
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search/${query}?format=json&countrycodes=NL&limit=3`
      );
      const coords = new firebase.firestore.GeoPoint(
        parseFloat(res.data[0].lat),
        parseFloat(res.data[0].lon)
      );
      this.geo = coords;
      const venue = {
        name: this.venue.name,
        location: {
          city: this.venue.address.city,
          address: `${this.venue.address.street} ${this.venue.address.number}`,
          geo: coords
        },
        owners: {
          [uid]: true
        },
        category: {
          bar: true
        },
        capacity: this.capacity,
        presentCount: 0
      };
      await this.$store.dispatch("addVenue", venue);
      console.log("added Venue");
    },
    async fetchLocation() {
      const { address } = this.venue;
      if (address.postcode.length && address.number.length) {
        try {
          const res = await axios.get(
            `https://api.postcodedata.nl/v1/postcode/?postcode=${address.postcode}&streetnumber=${address.number}&ref=domeinnaam.nl&type=json`
          );
          if (res.data.status === "ok") {
            this.venue.address = {
              ...address,
              ...res.data.details[0]
            };
          } else {
            address.street = "Kan geen geldige locatie vinden";
          }
        } catch (error) {
          console.log("fetchLocation: " + error);
        }
      }
    },
    async signUp() {
      if (this.method !== "email") {
        this.signupWithSocial(this.method);
        return;
      }
      if (!this.$refs.form.validate()) {
        return;
      }
      try {
        const res = await firebase
          .auth()
          .createUserWithEmailAndPassword(this.email, this.password);

        const currUser = await firebase.getCurrentUser();
        await currUser.updateProfile({
          displayName: this.name
        });

        const profile = {
          id: res.user.uid,
          name: this.name,
          owner: this.owner
        };

        await this.$store.dispatch("createProfile", profile);
        if (!this.owner) {
          this.$router.push(this.$route.query.redirect || "/");
          return;
        }
        // Else create venue for owner type
        await this.addVenue(res.user.uid);
        this.$router.push(this.$route.query.redirect || "/my-venues");
      } catch (error) {
        alert(error.message);
      }
    }
  },
  components: { Loading }
};
</script>
