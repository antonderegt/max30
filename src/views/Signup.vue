<template>
  <v-card width="400" class="mx-auto mt-5">
    <v-card-title>
      <h1 class="display-1">Signup</h1>
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
          v-model="email"
          :rules="emailRules"
          label="E-mail"
          prepend-icon="mdi-email"
          required
        ></v-text-field>
        <v-text-field
          v-model="password"
          :rules="passwordRules"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          prepend-icon="mdi-lock"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append="showPassword = !showPassword"
          required
        ></v-text-field>
        <v-text-field
          v-model="passwordVerification"
          :rules="passwordVerificationRules"
          label="Password again"
          :type="showPassword ? 'text' : 'password'"
          prepend-icon="mdi-lock"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append="showPassword = !showPassword"
          required
        ></v-text-field>
        <v-radio-group v-model="owner" label="What type of account" required>
          <v-radio label="Owner" value="true"></v-radio>
          <v-radio label="Visitor" value="false"></v-radio>
        </v-radio-group>
      </v-form>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions>
      <v-btn color="info" @click="signUp">Signup</v-btn>
      <v-spacer></v-spacer>
      <router-link to="/login">
        Already have an account?
      </router-link>
    </v-card-actions>
  </v-card>
</template>

<script>
import firebase from "firebase/app";
import { mapGetters } from "vuex";

export default {
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
      password: "",
      passwordRules: [
        v => !!v || "Password is required",
        v => (v && v.length >= 6) || "Password must be at least 6 characters"
      ],
      passwordVerification: "",
      passwordVerificationRules: [
        v => !!v || "Password Verification is required",
        v => (v && v === this.password) || "Passwords must be the same"
      ],
      showPassword: false,
      owner: false
    };
  },
  methods: {
    signUp() {
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.email, this.password)
        .then(res => {
          const profile = {
            id: res.user.uid,
            name: this.name,
            owner: this.owner
          };
          this.$store.dispatch("createProfile", profile);
          this.$router.replace("/login");
        })
        .catch(err => {
          alert(err.message);
        });
    }
  }
};
</script>
