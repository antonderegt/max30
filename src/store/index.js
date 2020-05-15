import Vue from "vue";
import Vuex from "vuex";
import { vuexfireMutations, firestoreAction } from "vuexfire";
import { db } from "@/db";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    queue: [],
    venueList: [],
    venue: {},
    user: {
      loggedIn: false,
      data: null
    }
  },
  mutations: {
    ...vuexfireMutations,
    SET_LOGGED_IN(state, value) {
      state.user.loggedIn = value;
    },
    SET_USER(state, data) {
      state.user.data = data;
    }
  },
  actions: {
    bindVenue: firestoreAction((bindFirestoreRef, id) => {
      return bindFirestoreRef.bindFirestoreRef(
        "venue",
        db.collection("horeca").doc(id)
      );
    }),
    bindVenueList: firestoreAction(bindFirestoreRef => {
      return bindFirestoreRef.bindFirestoreRef(
        "venueList",
        db.collection("horeca")
      );
    }),
    bindQueue: firestoreAction((bindFirestoreRef, id) => {
      return bindFirestoreRef.bindFirestoreRef(
        "queue",
        db
          .collection("horeca")
          .doc(id)
          .collection("queue")
          .orderBy("date")
      );
    }),
    fetchUser({ commit }, user) {
      commit("SET_LOGGED_IN", user !== null);

      if (user) {
        commit("SET_USER", {
          displayName: user.displayName,
          email: user.email
        });
      } else {
        commit("SET_USER", null);
      }
    }
  },
  getters: {
    user(state) {
      return state.user;
    }
  },
  modules: {}
});
