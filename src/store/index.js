import Vue from "vue";
import Vuex from "vuex";
import { vuexfireMutations, firestoreAction } from "vuexfire";
import { db, Timestamp } from "@/db";
import firebase from "firebase/app";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    waitList: [],
    venueList: [],
    venue: {},
    user: {
      loggedIn: false,
      data: null,
      profile: null
    },
    myVenues: [],
    waitListItem: {}
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
    ADD_TO_WAITLIST(state, waitlist) {
      state.waitlist.push(waitlist);
    },
    ADD_VENUE() {
      console.log("added venue");
    },
    UPDATE_PRESENT(state, newPresent) {
      state.venue.present = newPresent;
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
    bindWaitList: firestoreAction((bindFirestoreRef, id) => {
      return bindFirestoreRef.bindFirestoreRef(
        "waitList",
        db
          .collection("venues")
          .doc(id)
          .collection("waitlist")
          .where("status", "==", "waiting")
          .orderBy("timestamp")
      );
    }),
    bindSingleWaitListItem: firestoreAction(
      (bindFirestoreRef, waitlistItem) => {
        return bindFirestoreRef.bindFirestoreRef(
          "waitListItem",
          db
            .collection("venues")
            .doc(waitlistItem.venue)
            .collection("waitlist")
            .doc(waitlistItem.user)
        );
      }
    ),
    bindMyVenues: firestoreAction((bindFirestoreRef, id) => {
      return bindFirestoreRef.bindFirestoreRef(
        "myVenues",
        db
          .collection("profiles")
          .doc(id)
          .collection("venues")
      );
    }),
    async updateWaitList({ commit }, waitlist) {
      waitlist.timestamp = Timestamp.fromDate(new Date());
      try {
        await db
          .collection("venues")
          .doc(waitlist.venue)
          .collection("waitlist")
          .doc(waitlist.user)
          .update({
            status: waitlist.status
          });
      } catch (error) {
        console.log(error);
      }
      // commit("ADD_TO_WAITLIST", waitlist);
      console.log(commit);
    },
    async joinWaitList({ commit }, waitlist) {
      waitlist.timestamp = Timestamp.fromDate(new Date());
      try {
        await db
          .collection("venues")
          .doc(waitlist.venue)
          .collection("waitlist")
          .doc(waitlist.user)
          .set({
            name: waitlist.username,
            count: waitlist.count,
            timestamp: waitlist.timestamp,
            status: waitlist.status
          });
      } catch (error) {
        console.log(error);
      }
      commit("ADD_TO_WAITLIST", waitlist);
      this.dispatch("updateProfile", waitlist);
    },
    async updatePresent({ commit }, venue) {
      try {
        await db
          .collection("venues")
          .doc(venue.id)
          .update({
            present: venue.present
          });
      } catch (error) {
        console.log(error);
      }
      commit("UPDATE_PRESENT", venue.present);
    },
    async addVenue({ commit }, venue) {
      try {
        const res = await db.collection("venues").add(venue);

        commit("ADD_VENUE");
        var user = firebase.auth().currentUser;
        await db
          .collection("profiles")
          .doc(user.uid)
          .collection("venues")
          .doc(res.id)
          .set({
            name: venue.name
          });

        console.log("added venue to profile");
        this.dispatch("fetchUser", user);
      } catch (error) {
        console.error("Error writing document: ", error);
      }
    },
    async fetchProfile({ commit }, uid) {
      const docRef = db.collection("profiles").doc(uid);
      try {
        const doc = await docRef.get();
        if (doc.exists) {
          commit("UPDATE_PROFILE", doc.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.log("Error getting document:", error);
      }
    },
    async updateProfile({ commit }, profile) {
      try {
        await db
          .collection("profiles")
          .doc(profile.user)
          .update({
            waitingFor: profile.venue
          });
      } catch (error) {
        console.error("Error writing document: ", error);
      }
      this.dispatch("fetchProfile", profile.user);
      console.log(commit);
    },
    async createProfile({ commit }, profile) {
      try {
        await db
          .collection("profiles")
          .doc(profile.id)
          .set({
            name: profile.name,
            owner: profile.owner
          });
      } catch (error) {
        console.error("Error writing document: ", error);
      }
      commit("UPDATE_PROFILE", profile);
    },
    fetchUser({ commit }, user) {
      commit("SET_LOGGED_IN", user !== null);

      if (user) {
        commit("SET_USER", {
          displayName: user.displayName,
          email: user.email,
          uid: user.uid
        });

        this.dispatch("fetchProfile", user.uid);
      } else {
        commit("SET_USER", null);
      }
    }
  },
  getters: {
    user(state) {
      return state.user;
    },
    myVenues(state) {
      return state.myVenues;
    }
  },
  modules: {}
});
