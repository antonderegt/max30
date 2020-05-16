<template>
  <nav>
    <v-app-bar flat app>
      <v-app-bar-nav-icon
        class="grey--text"
        @click="drawer = !drawer"
      ></v-app-bar-nav-icon>
      <v-toolbar-title class="text-uppercase grey--text">
        <span class="font-weight-light">Max</span>
        <span>30</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="user.loggedIn" text color="grey" @click="logout">
        <span>Sign out</span>
        <v-icon right>exit_to_app</v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="title grey--text text-uppercase">
            <span class="font-weight-light">Max</span>
            <span>30</span>
          </v-list-item-title>
          <v-list-item-subtitle>
            Join the fun
            <span v-if="user.profile !== null">{{ user.profile.name }}</span>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider></v-divider>

      <v-list dense nav>
        <v-list-item v-for="item in items" :key="item.title" :to="item.link">
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <div v-if="user.profile !== null && user.profile.owner">
          <v-list-item to="/add-venue">
            <v-list-item-icon>
              <v-icon>mdi-map-plus</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Add Venue</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item to="/my-venues">
            <v-list-item-icon>
              <v-icon>mdi-map-marker</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>My Venues</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </div>
      </v-list>
    </v-navigation-drawer>
  </nav>
</template>

<script>
import firebase from "firebase/app";
require("firebase/auth");
import { mapGetters } from "vuex";

export default {
  props: ["items"],
  computed: {
    ...mapGetters({
      user: "user"
    })
  },
  data() {
    return {
      drawer: false,
      right: null
    };
  },
  methods: {
    logout() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          this.$router.replace("/login");
        });
    }
  }
};
</script>
