<template>
  <v-snackbar v-model="snackbar.show">
    {{ snackbar.text }}
    <v-btn color="pink" text @click="toggleSnackbar">
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
        text: ""
      };
      this.$store.dispatch("setSnackbar", snackbar);
    }
  }
  //   created() {
  //     this.$store.subscribe((mutation, state) => {
  //       if (mutation.type === "snackbar") {
  //         this.text = state.snackbar.text;
  //         this.show = state.snackbar.show;
  //       }
  //     });
  //   }
};
</script>
