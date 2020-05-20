<template>
  <v-container>
    <v-card width="400" class="mx-auto mt-5">
      <v-card-title>
        <h1 class="display-1">Add Venue</h1>
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
            v-model="city"
            :rules="nameRules"
            label="City"
            prepend-icon="mdi-account"
            required
          ></v-text-field>
          <v-text-field
            v-model="address"
            :rules="nameRules"
            label="Address"
            prepend-icon="mdi-account"
            required
          ></v-text-field>

          <v-divider></v-divider>
          <v-slider
            :label="'Capacity: ' + capacity"
            v-model="capacity"
            thumb-label
          ></v-slider>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn color="info" @click="addVenue">Add</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
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
      city: "",
      address: "",
      nameRules: [v => !!v || "Field is required"],
      capacity: 30
    };
  },
  methods: {
    async addVenue() {
      if (this.$refs.form.validate()) {
        const venue = {
          name: this.name,
          location: {
            city: this.city,
            address: this.address
          },
          capacity: this.capacity,
          present: 0
        };
        await this.$store.dispatch("addVenue", venue);
        this.$router.push("/my-venues");
      }
    },
    async signUp() {
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
};
</script>
