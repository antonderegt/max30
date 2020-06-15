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
            :rules="rules.nameRules"
            label="Naam"
            prepend-icon="mdi-account"
            required
          ></v-text-field>
          <v-text-field
            v-if="method === 'email'"
            v-model="email"
            :rules="rules.emailRules"
            label="Email"
            prepend-icon="mdi-email"
            required
          ></v-text-field>
          <v-text-field
            v-if="method === 'email'"
            v-model="password"
            :rules="rules.passwordRules"
            label="Wachtwoord"
            :type="showPassword ? 'text' : 'password'"
            prepend-icon="mdi-lock"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="showPassword = !showPassword"
            required
          ></v-text-field>
          <span v-if="owner">Vul de gegevens in van je eerste plekkie</span>
          <AddVenueForm
            v-if="owner"
            ref="addVenueComponent"
            :allFields="false"
          />
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
import { mapState } from "vuex";
import Loading from "@/components/Loading.vue";
import AddVenueForm from "@/components/AddVenueForm.vue";

export default {
  props: ["isVenue"],
  name: "signup",
  computed: {
    ...mapState(["user", "rules"])
  },
  data() {
    return {
      loading: false,
      method: "",
      valid: true,
      lazy: true,
      name: "",
      email: "",
      venue: {
        name: "",
        address: {
          postcode: "",
          number: "",
          street: ""
        }
      },
      password: "",
      showPassword: false,
      capacity: 30,
      owner: this.isVenue
    };
  },
  methods: {
    async signupWithSocial(provider) {
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
        this.$refs.addVenueComponent.addVenue();
      } catch (error) {
        console.log("signInWithSocial: " + error);
      }
    },
    async signUp() {
      if (!this.$refs.form.validate()) return;
      this.loading = true;
      window.scrollTo(0, 0);

      if (this.method !== "email") {
        this.signupWithSocial(this.method);
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
        this.$refs.addVenueComponent.addVenue();
      } catch (error) {
        alert(error.message);
      }
    }
  },
  components: { Loading, AddVenueForm }
};
</script>
