<template>
  <v-container>
    <Loading v-if="loading" />
    <v-card width="400" class="mx-auto mt-5">
      <v-card-title>
        <h1 class="display-1">Wachtwoord vergeten</h1>
      </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" :lazy-validation="lazy">
          <v-text-field
            @keyup.enter="login"
            v-model="email"
            :rules="emailRules"
            label="E-mail"
            prepend-icon="mdi-account"
            required
          ></v-text-field>
        </v-form>

        <router-link :to="signup">
          Account nodig?
        </router-link>
      </v-card-text>

      <v-divider></v-divider>
      <v-card-actions>
        <v-btn text :to="login">Naar login</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="secondary"
          class="dark--text"
          @click.prevent="sendPasswordResetEmail"
          >Stuur reset email</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import firebase from "firebase/app";
import Loading from "@/components/Loading.vue";

export default {
  data: function() {
    return {
      loading: false,
      valid: true,
      lazy: true,
      email: "",
      emailRules: [
        v => !!v || "E-mail is required",
        v => /.+@.+\..+/.test(v) || "E-mail must be valid"
      ],
      signup: this.$route.query.redirect
        ? `/signup?redirect=${this.$route.query.redirect}`
        : "/signup",
      login: this.$route.query.redirect
        ? `/login?redirect=${this.$route.query.redirect}`
        : "/login"
    };
  },
  methods: {
    async sendPasswordResetEmail() {
      if (!this.$refs.form.validate("email")) return;

      try {
        await firebase.auth().sendPasswordResetEmail(this.email);
        this.$store.dispatch("setSnackbar", {
          show: true,
          text: "Wachtwoord reset mail verzonden"
        });
        this.$router.push(this.$route.query.redirect || "/login");
      } catch (error) {
        let errorText = error;
        if (
          error ==
          "Error: There is no user record corresponding to this identifier. The user may have been deleted."
        ) {
          errorText = "Geen gebruiker gevonden met dit email adres";
        }
        this.$store.dispatch("setSnackbar", {
          show: true,
          text: errorText
        });
        console.log("sendPasswordResetEmail: " + error);
      }
    },
    validate() {
      this.$refs.form.validate();
    }
  },
  components: { Loading }
};
</script>
