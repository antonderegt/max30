<template>
  <v-snackbar v-model="snackbar.show" :color="snackbar.color">
    {{ snackbar.text }}
    <v-btn text @click="toggleSnackbar">
      Close
    </v-btn>
  </v-snackbar>
</template>

<script>
import { mapState } from "vuex";

export default {
  computed: mapState(["snackbar"]),
  data() {
    return {
      show: false,
      text: ""
    };
  },
  methods: {
    toggleSnackbar() {
      const snackbar = {
        show: false,
        text: "",
        color: ""
      };
      this.$store.dispatch("setSnackbar", snackbar);
    }
  }
};
</script>
