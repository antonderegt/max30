import Vue from "vue";
import Vuetify from "vuetify/lib";
import "material-design-icons-iconfont/dist/material-design-icons.css";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        // Geel rood variant
        primary: "#EE4266", // Rood
        secondary: "#FFD23F", // Geel
        accent: "#9A4EAE", // Paars
        error: "#EE4266", //
        info: "#F3FCF0", // Wit
        dark: "#1F271B", // Zwart
        semidark: "#a0a090",
        success: "#000000", //
        warning: "#000000" //
      }
    }
  }
});
