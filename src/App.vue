<template>
  <v-app :style="{ background: $vuetify.theme.themes.light.primary }">
    <NavBar :items="items" />

    <v-content
      :style="{
        'background-image': `url(${backgroundImage})`,
        'background-size': 'cover'
      }"
    >
      <Snackbar />
      <router-view />
    </v-content>
  </v-app>
</template>

<script>
import NavBar from "@/components/NavBar.vue";
import Snackbar from "@/components/Snackbar.vue";

export default {
  data() {
    return {
      items: [
        { title: "Home", icon: "mdi-view-dashboard", link: "/" },
        {
          title: "Wachtruimte",
          icon: "mdi-paper-roll",
          link: "/waiting-room"
        },
        {
          title: "Hoe werkt het?",
          icon: "mdi-comment-question",
          link: "/faq"
        },
        {
          title: "Mijn Profiel",
          icon: "mdi-account-circle",
          link: "/my-profile"
        }
      ]
    };
  },
  computed: {
    backgroundImage() {
      return this.$route.path == "/register-venue"
        ? "https://images.unsplash.com/photo-1531674842274-9563aa15686f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1301&q=80"
        : "";
    }
  },
  components: { NavBar, Snackbar }
};
</script>

<style>
html {
  overflow-x: auto;
}
</style>
