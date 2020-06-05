<template>
  <v-container>
    <Loading v-if="loading" />
    <v-row justify="center" v-if="!loading">
      <v-col cols="12" md="6">
        <v-card max-width="400" class="mx-auto">
          <v-row class="pa-0" no-gutters>
            <v-col v-if="isEdit && editedUser.data" cols="10" class="ma-4">
              <!-- Venue info fields -->
              <v-text-field
                label="Naam"
                v-model="editedUser.data.displayName"
                prepend-icon="mdi-card-account-details-outline"
              ></v-text-field>
              <v-text-field
                label="Email"
                v-model="editedUser.data.email"
                prepend-icon="mdi-email"
              ></v-text-field>
              <v-row class="pa-2 mt-10" justify="center" no-gutters>
                <v-col>
                  <v-btn small color="error" class="ma-2" @click="deleteVenue()"
                    >Verwijder Profiel en Venues uit Plekkie</v-btn
                  >
                </v-col>
              </v-row>
            </v-col>

            <v-col v-else cols="11">
              <v-card-title>{{ user.data.displayName }} </v-card-title>
              <v-card-subtitle>{{ user.data.email }} </v-card-subtitle>
            </v-col>
            <v-col @click="toggleEdit()" cols="1 pt-4">
              <v-icon>{{ isEdit ? "done" : "create" }}</v-icon>
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
// import axios from "axios";
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
      isEdit: false,
      editedUser: null
    };
  },
  watch: {
    user: {
      deep: true,
      handler(newValue) {
        this.loading = false;
        this.editedUser = newValue; // prefill edit fields
      }
    }
  },
  methods: {
    async toggleEdit() {
      if (this.isEdit) {
        console.log(this.editedUser);
        //TODO: update profile and user
        // await this.$store.dispatch("createProfile", this.editedUser.data.profile);
      }
      this.isEdit = !this.isEdit;
    }
  },
  components: { Loading },
  async created() {
    const currUser = await firebase.getCurrentUser();
    console.log(currUser);
    await this.$store.dispatch("fetchUser", currUser);
  }
};
</script>
