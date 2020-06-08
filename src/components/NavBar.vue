<template>
  <nav>
    <v-app-bar flat color="primary" app>
      <v-app-bar-nav-icon
        class="accent--text"
        @click="drawer = !drawer"
      ></v-app-bar-nav-icon>
      <v-btn to="/" text color="accent">
        <v-toolbar-title class="text-uppercase accent--text">
          <span>Plek</span>
          <span class="font-weight-light">kie</span>
        </v-toolbar-title>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn v-if="user.loggedIn" text color="accent" @click="logout">
        <span>Sign out</span>
        <v-icon right>exit_to_app</v-icon>
      </v-btn>
      <v-btn
        v-else-if="
          this.$route.path !== '/signup' && this.$route.path !== '/login'
        "
        text
        class="px-0"
        color="accent"
        to="/signup"
      >
        <span>Meld je aan</span>
        <v-icon right>exit_to_app</v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" color="primary" app>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="title accent--text text-uppercase">
            <span>Plek</span>
            <span class="font-weight-light">kie</span>
          </v-list-item-title>
          <v-list-item-subtitle class="accent--text">
            Vind een plekkie
            <span v-if="user.profile !== null">{{
              user.data.displayName
            }}</span>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider></v-divider>

      <v-list dense nav>
        <v-list-item v-for="item in items" :key="item.title" :to="item.link">
          <v-list-item-icon>
            <v-icon color="accent">{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content class="accent--text">
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <div
          v-if="user.profile !== null && user.profile.owner"
          class="accent--text"
        >
          Beheerders
          <v-divider></v-divider>
          <v-list-item to="/my-profile">
            <v-list-item-icon>
              <v-icon color="accent">mdi-account-circle</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title class="accent--text"
                >Mijn Profiel</v-list-item-title
              >
            </v-list-item-content>
          </v-list-item>
          <v-list-item to="/my-venues">
            <v-list-item-icon>
              <v-icon color="accent">mdi-map-marker</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title class="accent--text"
                >Mijn Plekken</v-list-item-title
              >
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
    async logout() {
      await firebase.auth().signOut();
      this.$router.replace("/login");
    }
  }
};
</script>
