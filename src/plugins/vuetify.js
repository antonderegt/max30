import Vue from "vue";
import Vuetify from "vuetify/lib";
import "material-design-icons-iconfont/dist/material-design-icons.css";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: "#B248F8", // Electric Purple
        secondary: "#C98DF7", // Bright Lilac
        accent: "#F7F7F7", // Cultured (white)
        error: "#EAEAED", // Platinum (gray)
        info: "#000000",
        success: "#000000",
        warning: "#000000"
      }
    }
  }
});
