import Vue from "vue";
import VueRouter from "vue-router";
import firebase from "firebase/app";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/venue/:id",
    name: "Venue",
    component: () => import("@/components/Venue.vue"),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue")
  },
  {
    path: "/signup",
    name: "Signup",
    component: () => import("@/views/Signup.vue")
  },
  {
    path: "/add-venue",
    name: "AddVenue",
    component: () => import("@/views/owner/AddVenue.vue")
  },
  {
    path: "/my-venues",
    name: "MyVenues",
    component: () => import("@/views/owner/MyVenues.vue")
  },
  {
    path: "/waiting-room",
    name: "WaitingRoom",
    component: () => import("@/views/WaitingRoom.vue")
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

router.beforeEach((to, from, next) => {
  let currentUser = firebase.auth().currentUser;
  let requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  if (requiresAuth && !currentUser) next("/login");
  // else if (!requiresAuth && currentUser) next();
  else next();
});

export default router;
