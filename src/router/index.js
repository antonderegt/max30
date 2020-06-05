import Vue from "vue";
import VueRouter from "vue-router";
import firebase from "firebase/app";
import Home from "@/views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/venue/:venue",
    name: "Venue",
    component: () => import("@/components/VenueCard.vue")
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue")
  },
  {
    path: "/register-venue",
    name: "SignupVenue",
    component: () => import("@/views/Signup.vue"),
    props: { isVenue: true }
  },
  {
    path: "/signup",
    name: "Signup",
    component: () => import("@/views/Signup.vue"),
    props: { isVenue: false }
  },
  {
    path: "/add-venue",
    name: "AddVenue",
    component: () => import("@/views/owner/AddVenue.vue"),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/my-venues",
    name: "MyVenues",
    component: () => import("@/views/owner/MyVenues.vue"),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/my-venue/:venue",
    name: "MyVenue",
    component: () => import("@/components/VenueCard.vue"),
    props: { isAdmin: true },
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/waiting-room",
    name: "WaitingRoom",
    component: () => import("@/views/WaitingRoom.vue"),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/privacy-policy",
    name: "PrivacyPolicy",
    component: () => import("@/views/PrivacyPolicy.vue")
  },
  {
    path: "/faq",
    name: "FAQ",
    component: () => import("@/views/FAQ.vue")
  },
  {
    path: "/my-profile",
    name: "Profiel",
    component: () => import("@/views/MyProfile.vue")
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  if (requiresAuth && !(await firebase.getCurrentUser())) {
    next({ name: "Login", query: { redirect: to.path } });
  } else {
    next();
  }
});

export default router;
