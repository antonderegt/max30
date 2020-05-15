<template>
  <v-app class="grey lighten-4">
    <NavBar :items="items" />

    <v-content>
      <router-view />
    </v-content>
  </v-app>
</template>

<script>
import NavBar from "@/components/NavBar.vue";

export default {
  data() {
    return {
      items: [{ title: "Home", icon: "mdi-view-dashboard", link: "/" }]
    };
  },
  components: { NavBar }
};
</script>
