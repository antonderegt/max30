<template>
  <v-container>
    <v-card width="400" class="mx-auto mt-5">
      <v-card-title>
        <h1 class="display-1">Login</h1>
      </v-card-title>
      <v-card-text>
        <v-btn @click="loginWithSocial('google')" class="mr-2">
          <v-icon class="mr-2">fab fa-google</v-icon>
          google</v-btn
        ><v-btn @click="loginWithSocial('facebook')">
          <v-icon class="mr-2">fab fa-facebook</v-icon>
          facebook</v-btn
        >
        <v-form ref="form" v-model="valid" :lazy-validation="lazy">
          <v-text-field
            @keyup.enter="login"
            v-model="email"
            :rules="emailRules"
            label="E-mail"
            prepend-icon="mdi-account"
            required
          ></v-text-field>
          <v-text-field
            @keyup.enter="login"
            v-model="password"
            :rules="passwordRules"
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            prepend-icon="mdi-lock"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="showPassword = !showPassword"
            required
          ></v-text-field>
        </v-form>
        <a @click="sendPasswordResetEmail">Wachtwoord vergeten</a>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn color="info" @click.prevent="login">Login</v-btn>
        <v-spacer></v-spacer>
        <router-link to="/signup">
          New Here? Create a new account
        </router-link>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import firebase from "firebase/app";

export default {
  data: function() {
    return {
      valid: true,
      lazy: true,
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
      showPassword: false
    };
  },
  methods: {
    async loginWithSocial(provider) {
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
            owner: false
          };
          await this.$store.dispatch("createProfile", profile);
        }
        this.$router.push(this.$route.query.redirect || "/");
      } catch (error) {
        console.log("signInWithSocial: " + error);

        // Handle Errors here.
        // var errorCode = error.code;
        // var errorMessage = error.message;
        // // The email of the user's account used.
        // var email = error.email;
        // // The firebase.auth.AuthCredential type that was used.
        // var credential = error.credential;
        // ...
      }
    },
    async login() {
      if (this.$refs.form.validate()) {
        try {
          await firebase
            .auth()
            .signInWithEmailAndPassword(this.email, this.password);
        } catch (err) {
          alert(err.message);
        }
        this.$router.push(this.$route.query.redirect || "/");
      }
    },
    async sendPasswordResetEmail() {
      if (!this.$refs.form.validate("email")) {
        this.$store.dispatch("setSnackbar", {
          show: true,
          text: "E-mail invalid"
        });
      }
      try {
        await firebase.auth().sendPasswordResetEmail(this.email);
        this.$store.dispatch("setSnackbar", {
          show: true,
          text: "Wachtwoord reset mail verzonden"
        });
      } catch (error) {
        console.log("sendPasswordResetEmail: " + error);
      }
    },
    validate() {
      this.$refs.form.validate();
    },
    reset() {
      this.$refs.form.reset();
    },
    resetValidation() {
      this.$refs.form.resetValidation();
    }
  }
};
</script>
