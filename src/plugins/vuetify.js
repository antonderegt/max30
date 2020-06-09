import Vue from "vue";
import Vuetify from "vuetify/lib";
import "material-design-icons-iconfont/dist/material-design-icons.css";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        // Paarse variant
        // primary: "#B248F8", // Electric Purple
        // secondary: "#C98DF7", // Bright Lilac
        // accent: "#F7F7F7", // Cultured (white)
        // error: "#C98DF7", // Secondary
        // info: "#000000",
        // success: "#B248F8", // Primary
        // warning: "#EAEAED" // Platinum (gray)

        // Geel rood variant
        primary: "#FFD23F", // Geel
        secondary: "#EE4266", // Rood
        accent: "#540D6E", // Paars
        error: "#000000", //
        info: "#F3FCF0", // Wit
        dark: "#1F271B",
        semidark: "#a0a090",
        success: "#000000", //
        warning: "#000000" //
      }
    }
  }
});
