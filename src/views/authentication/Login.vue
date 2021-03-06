<template>
  <v-container>
    <Loading v-if="loading" />
    <v-card width="400" class="mx-auto mt-5">
      <v-card-title>
        <h1 class="display-1">Login</h1>
      </v-card-title>
      <v-card-text>
        <v-row v-if="!resetPassword" justify="center" class="pa-2">
          <v-btn
            @click="loginWithSocial('google')"
            color="#4285F4"
            class="ma-2 white--text"
            block
          >
            <v-icon color="white" class="mr-2">fab fa-google</v-icon>
            google</v-btn
          ><v-btn
            @click="loginWithSocial('facebook')"
            color="#4267B2"
            class="ma-2 white--text"
            block
          >
            <v-icon color="white" class="mr-2">fab fa-facebook</v-icon>
            facebook</v-btn
          >
        </v-row>
        <v-form ref="form" v-model="valid" :lazy-validation="lazy">
          <v-text-field
            @keyup.enter="login"
            v-model="email"
            :rules="rules.emailRules"
            label="E-mail"
            prepend-icon="mdi-account"
            required
          ></v-text-field>
          <v-text-field
            @keyup.enter="login"
            v-model="password"
            :rules="rules.passwordRules"
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            prepend-icon="mdi-lock"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="showPassword = !showPassword"
            required
          ></v-text-field>
        </v-form>
        <router-link :to="passwordReset">Wachtwoord vergeten?</router-link>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn text :to="signup">Account nodig?</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="secondary" class="dark--text" @click.prevent="login"
          >Login</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import firebase from "firebase/app";
import { mapState } from "vuex";
import Loading from "@/components/Loading.vue";

export default {
  computed: {
    ...mapState(["rules"])
  },
  data: function() {
    return {
      loading: false,
      valid: true,
      lazy: true,
      resetPassword: false,
      email: "",
      password: "",
      showPassword: false,
      signup: this.$route.query.redirect
        ? `/signup?redirect=${this.$route.query.redirect}`
        : "/signup",
      passwordReset: this.$route.query.redirect
        ? `/password-reset?redirect=${this.$route.query.redirect}`
        : "/password-reset"
    };
  },
  methods: {
    async loginWithSocial(provider) {
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
            owner: false
          };
          await this.$store.dispatch("createProfile", profile);
        }
        this.$router.push(this.$route.query.redirect || "/");
        this.loading = false;
      } catch (error) {
        console.log("signInWithSocial: " + error);
      }
    },
    async login() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        try {
          await firebase
            .auth()
            .signInWithEmailAndPassword(this.email, this.password);
          this.loading = false;
        } catch (err) {
          alert(err.message);
        }
        this.$router.push(this.$route.query.redirect || "/");
      }
    },
    validate() {
      this.$refs.form.validate();
    }
  },
  components: { Loading }
};
</script>
