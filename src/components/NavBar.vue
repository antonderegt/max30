<template>
  <nav>
    <v-app-bar flat color="primary" app>
      <v-app-bar-nav-icon
        class="info--text"
        @click="drawer = !drawer"
      ></v-app-bar-nav-icon>
      <v-btn to="/" text color="info">
        <v-toolbar-title class="text-uppercase info--text">
          <span>Plek</span>
          <span class="font-weight-light">kie</span>
        </v-toolbar-title>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn class="hidden-xs-only" text color="info" to="/faq">
        <span>Hoe werkt het?</span>
      </v-btn>
      <v-btn v-if="user.loggedIn" text color="info" @click="logout">
        <span>Uitloggen</span>
        <v-icon right>exit_to_app</v-icon>
      </v-btn>
      <v-btn
        v-else-if="
          this.$route.path !== '/signup' && this.$route.path !== '/login'
        "
        text
        class="px-0"
        color="info"
        to="/signup"
      >
        <span>Meld je aan</span>
        <v-icon right>exit_to_app</v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" color="primary" app>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="title info--text text-uppercase">
            <span>Plek</span>
            <span class="font-weight-light">kie</span>
          </v-list-item-title>
          <v-list-item-subtitle class="info--text">
            Vind een plekkie
            <span v-if="user.profile !== null">{{
              user.data.displayName
            }}</span>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider></v-divider>

      <v-list dense nav color="primary">
        <v-list-item v-for="item in items" :key="item.title" :to="item.link">
          <v-list-item-icon>
            <v-icon color="info">{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content class="info--text">
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <div
          v-if="user.profile !== null && user.profile.owner"
          class="info--text"
        >
          Beheerders
          <v-divider></v-divider>
          <v-list-item to="/my-profile">
            <v-list-item-icon>
              <v-icon color="info">mdi-account-circle</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title class="info--text"
                >Mijn Profiel</v-list-item-title
              >
            </v-list-item-content>
          </v-list-item>
          <v-list-item to="/my-venues">
            <v-list-item-icon>
              <v-icon color="info">mdi-map-marker</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title class="info--text"
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
