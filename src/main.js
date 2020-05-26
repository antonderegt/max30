import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import firebase from "firebase/app";
import VueChatScroll from "vue-chat-scroll";
import SocialSharing from "vue-social-sharing";
Vue.use(SocialSharing);

Vue.use(VueChatScroll);

Vue.config.productionTip = false;

firebase.auth().onAuthStateChanged(user => {
  store.dispatch("fetchUser", user);
});

firebase.getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
