import Vue from "vue";
import Vuex from "vuex";
import { vuexfireMutations, firestoreAction } from "vuexfire";
import { db } from "@/db";
import firebase from "firebase/app";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    queue: [],
    venueList: [],
    venue: {},
    user: {
      loggedIn: false,
      data: null,
      profile: null
    }
  },
  mutations: {
    ...vuexfireMutations,
    SET_LOGGED_IN(state, value) {
      state.user.loggedIn = value;
    },
    SET_USER(state, data) {
      state.user.data = data;
    },
    UPDATE_PROFILE(state, profile) {
      state.user.profile = profile;
    },
    ADD_VENUE() {
      console.log("added venue");
    }
  },
  actions: {
    bindVenue: firestoreAction((bindFirestoreRef, id) => {
      return bindFirestoreRef.bindFirestoreRef(
        "venue",
        db.collection("venues").doc(id)
      );
    }),
    bindVenueList: firestoreAction(bindFirestoreRef => {
      return bindFirestoreRef.bindFirestoreRef(
        "venueList",
        db.collection("venues")
      );
    }),
    bindQueue: firestoreAction((bindFirestoreRef, id) => {
      return bindFirestoreRef.bindFirestoreRef(
        "queue",
        db
          .collection("venues")
          .doc(id)
          .collection("queue")
          .orderBy("date")
      );
    }),
    addVenue({ commit }, venue) {
      db.collection("venues")
        .add(venue)
        .then(ven => {
          commit("ADD_VENUE");
          var user = firebase.auth().currentUser;
          db.collection("profiles")
            .doc(user.uid)
            .collection("venues")
            .doc(ven.id)
            .set({
              name: venue.name
            })
            .then(() => {
              console.log("added venue to profile");
              this.fetchUser(user);
            })
            .catch(error => {
              alert(error);
            });
        })
        .catch(error => {
          console.error("Error writing document: ", error);
        });
    },
    createProfile({ commit }, profile) {
      db.collection("profiles")
        .doc(profile.id)
        .set({
          name: profile.name,
          owner: profile.owner
        })
        .then(function() {
          commit("UPDATE_PROFILE", profile);
        })
        .catch(function(error) {
          console.error("Error writing document: ", error);
        });
    },
    fetchUser({ commit }, user) {
      commit("SET_LOGGED_IN", user !== null);

      if (user) {
        commit("SET_USER", {
          displayName: user.displayName,
          email: user.email
        });
        const docRef = db.collection("profiles").doc(user.uid);

        docRef
          .get()
          .then(function(doc) {
            if (doc.exists) {
              commit("UPDATE_PROFILE", doc.data());
            } else {
              console.log("No such document!");
            }
          })
          .catch(function(error) {
            console.log("Error getting document:", error);
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
