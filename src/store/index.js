import Vue from "vue";
import Vuex from "vuex";
import { vuexfireMutations, firestoreAction } from "vuexfire";
import { db } from "@/db";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    queue: [],
    venueList: [],
    venue: {}
  },
  mutations: {
    ...vuexfireMutations
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
    })
  },
  modules: {}
});
