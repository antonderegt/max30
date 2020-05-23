<template>
  <v-app class="white lighten-4">
    <NavBar :items="items" />

    <v-content
      :style="{
        'background-image': `url(${backgroundImage})`,
        'background-size': 'cover'
      }"
    >
      <router-view />
    </v-content>
  </v-app>
</template>

<script>
import NavBar from "@/components/NavBar.vue";

export default {
  data() {
    return {
      items: [
        { title: "Home", icon: "mdi-view-dashboard", link: "/" },
        {
          title: "Waiting Room",
          icon: "mdi-paper-roll",
          link: "/waiting-room"
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
  components: { NavBar }
};
</script>
