<template>
  <v-container>
    <Loading v-if="loading" />
    <v-row justify="center" v-if="!loading">
      <v-col cols="12" md="6">
        <v-card max-width="400" class="mx-auto">
          <v-row v-if="isEdit && editedUser.data" cols="12">
            <v-col>
              <!-- Venue info fields -->
              <v-text-field
                class="ma-2"
                label="Naam"
                v-model="editedUser.data.displayName"
                prepend-icon="mdi-card-account-details-outline"
              ></v-text-field>
              <v-text-field
                class="ma-2"
                label="Email"
                v-model="editedUser.data.email"
                prepend-icon="mdi-email"
              ></v-text-field>
              <v-text-field
                class="ma-2"
                v-if="provider === 'password'"
                v-model="oldPassword"
                :rules="passwordRules"
                label="Oude wachtwoord"
                :type="showPassword ? 'text' : 'password'"
                prepend-icon="mdi-lock"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
                required
              ></v-text-field>
              <v-text-field
                class="ma-2"
                v-if="provider === 'password'"
                v-model="newPassword"
                :rules="passwordRules"
                label="Verander wachtwoord"
                :type="showPassword ? 'text' : 'password'"
                prepend-icon="mdi-lock"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
                required
              ></v-text-field>
              <v-dialog v-model="dialog" max-width="380" class="mx-auto">
                <v-card>
                  <v-card-title class="headline">
                    Verwijderen profiel
                  </v-card-title>
                  <v-card-text
                    >Weet je zeker dat je jouw profiel wilt verwijderen?
                    <br />Je verwijdert je profiel, maar ook alle plekkies die
                    gekoppeld zijn aan jouw account.</v-card-text
                  >
                  <v-text-field
                    class="ml-4 mr-10"
                    v-if="provider === 'password'"
                    v-model="oldPassword"
                    :rules="passwordRules"
                    label="Wachtwoord"
                    :type="showPassword ? 'text' : 'password'"
                    prepend-icon="mdi-lock"
                    :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="showPassword = !showPassword"
                    required
                  ></v-text-field>
                  <v-divider></v-divider>
                  <v-card-actions>
                    <v-btn color="green darken-1" text @click="dialog = false"
                      >Annuleer</v-btn
                    ><v-spacer></v-spacer>
                    <v-btn color="red darken-1" text @click="deleteAccount()"
                      >Verwijder</v-btn
                    >
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-divider></v-divider>
              <v-card-actions>
                <v-btn color="secondary" text @click="dialog = !dialog">
                  Verwijder Profiel
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn @click="toggleEdit()" color="primary">save</v-btn>
              </v-card-actions>
            </v-col>
          </v-row>

          <v-row v-else>
            <v-col cols="10">
              <v-card-title>{{ user.data.displayName }} </v-card-title>
              <v-card-subtitle>{{ user.data.email }} </v-card-subtitle>
            </v-col>
            <v-col @click="toggleEdit()" cols="2 pt-4">
              <v-icon color="accent">create</v-icon>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import firebase from "firebase/app";
import { mapGetters } from "vuex";
import Loading from "@/components/Loading.vue";

export default {
  name: "MyProfile",
  computed: {
    ...mapGetters({
      user: "user"
    })
  },
  data() {
    return {
      loading: true,
      dialog: false,
      isEdit: false,
      editedUser: null,
      currUser: null,
      provider: "",
      showPassword: false,
      oldPassword: "",
      newPassword: "",
      //TODO: move general rules to vuex store?
      passwordRules: [
        v => !!v || "Wachtwoord is verplicht",
        v =>
          (v && v.length >= 6) || "Wachtwoord moet minstens 6 characters zijn"
      ],
      emailRules: [
        v => !!v || "E-mail is verplicht",
        v => /.+@.+\..+/.test(v) || "E-mail moet geldig zijn"
      ]
    };
  },
  watch: {
    user: {
      deep: true,
      handler(newValue) {
        this.loading = false;
        this.editedUser = JSON.parse(JSON.stringify(newValue)); // prefill edit fields
      }
    }
  },
  methods: {
    async toggleEdit() {
      if (this.isEdit) {
        this.loading = true;
        try {
          // Update displayname if changed
          if (this.editedUser.data.displayName !== this.user.data.displayName) {
            await this.currUser.updateProfile({
              displayName: this.editedUser.data.displayName
            });
          }
          // Update email if changed
          if (this.editedUser.data.email !== this.user.data.email) {
            await this.currUser.updateEmail(this.editedUser.data.email);
          }

          // If new password is set
          if (this?.newPassword?.length > 5 && this.provider === "password") {
            const credential = firebase.auth.EmailAuthProvider.credential(
              this.user.data.email,
              this.oldPassword
            );
            await this.currUser.reauthenticateWithCredential(credential);
            await this.currUser.updatePassword(this.newPassword);
          }

          // Refetch user
          await this.fetchUser();

          // return snackbar message
          this.$store.dispatch("setSnackbar", {
            show: true,
            text: "Je profiel is gewijzigd!",
            color: "info"
          });
        } catch (e) {
          console.error(e);
          let text = "";
          if (e.code === "auth/wrong-password") {
            text = "Verkeerd wachtwoord ingevoerd. Wijzigen mislukt";

            // Clear password fields
            this.newPassword = "";
            this.oldPassword = "";
          }

          // Display correct error message to user
          this.$store.dispatch("setSnackbar", {
            show: true,
            text,
            color: "error"
          });
        }
      }

      // Toggle edit view and disable loading indicator
      this.loading = false;
      this.isEdit = !this.isEdit;
    },
    async deleteAccount() {
      let resMsg = "Account succesvol verwijderd!";
      let resColor = "success";
      try {
        const credential = firebase.auth.EmailAuthProvider.credential(
          this.user.data.email,
          this.oldPassword
        );
        await this.currUser.reauthenticateWithCredential(credential);
        await this.currUser.delete();
      } catch (e) {
        resColor = "error";
        resMsg = "Kan profiel niet verwijderen.";
        if (e.code === "auth/wrong-password") {
          resMsg = "Verkeerd wachtwoord ingevoerd. Verwijderen mislukt";
          // Clear password fields
          this.oldPassword = "";
        }
      }

      this.$store.dispatch("setSnackbar", {
        show: true,
        text: resMsg,
        color: resColor
      });

      if (resColor === "success") {
        //succesfull deleted, redirect home
        this.$router.push("/");
      }
    },
    async fetchUser() {
      this.currUser = await firebase.getCurrentUser();
      this.provider = this.currUser.providerData[0].providerId; // password = mail, google.com or facebook.com etc.
      await this.$store.dispatch("fetchUser", this.currUser);
    }
  },
  components: { Loading },
  async created() {
    this.fetchUser();
  }
};
</script>
