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
    waitListItem: {}, // TODO: deprecate when data models are updated
    waitLists: [],
    chat: []
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
    ADD_TO_WAITLIST(state, waitList) {
      state.waitList.push(waitList);
    },
    UPDATE_PRESENT(state, newPresent) {
      state.venue.presentCount = newPresent;
    }
  },
  actions: {
    bindVenue: firestoreAction((bindFirestoreRef, id) => {
      // Updated to new Data Model
      return bindFirestoreRef.bindFirestoreRef(
        "venue",
        db.collection("venues").doc(id)
      );
    }),
    bindVenueList: firestoreAction(bindFirestoreRef => {
      // Updated to new Data Model
      return bindFirestoreRef.bindFirestoreRef(
        "venueList",
        db.collection("venues")
      );
    }),
    bindWaitList: firestoreAction((bindFirestoreRef, venueID) => {
      // Updated to new Data Model
      return bindFirestoreRef.bindFirestoreRef(
        "waitList",
        db
          .collection("waitlists")
          .where("venueID", "==", venueID)
          .where("status", "==", "waiting")
          .orderBy("timestamp")
      );
    }),
    bindWaitLists: firestoreAction(
      // Updated to new Data Model
      (bindFirestoreRef, userID) => {
        return bindFirestoreRef.bindFirestoreRef(
          "waitLists",
          db.collection("waitlists").where("userID", "==", userID)
        );
      }
    ),
    bindMyVenues: firestoreAction((bindFirestoreRef, userID) => {
      // Updated to new Data Model
      return bindFirestoreRef.bindFirestoreRef(
        "myVenues",
        db.collection("venues").where(`owners.${userID}`, "==", true)
      );
    }),
    bindChat: firestoreAction((bindFirestoreRef, chat) => {
      // Updated to new Data Model
      try {
        return bindFirestoreRef.bindFirestoreRef(
          "chat",
          db
            .collection("chats")
            .doc(`${chat.venueID}_${chat.userID}`)
            .collection("messages")
            .orderBy("timestamp")
        );
      } catch (error) {
        console.log(error);
      }
    }),
    async updateWaitList(_, waitListItem) {
      // Updated to new Data Model
      try {
        await db
          .collection("waitlists")
          .doc(waitListItem.waitListID)
          .update({
            status: waitListItem.status
          });
      } catch (error) {
        console.log(error);
      }
    },
    async checkIfUserAlreadyInQueue(_, waitListItem) {
      // Updated to new Data Model
      const doc = await db
        .collection("waitlists")
        .where("userID", "==", waitListItem.userID)
        .where("venueID", "==", waitListItem.venueID)
        .where("status", "==", "waiting")
        .get();
      if (doc?.docs[0]?.id) {
        return true;
      } else {
        return false;
      }
    },
    async joinWaitList({ commit }, waitListItem) {
      // Updated to new Data Model
      waitListItem.timestamp = Timestamp.fromDate(new Date());
      try {
        await db.collection("waitlists").add({
          userID: waitListItem.userID,
          venueID: waitListItem.venueID,
          personCount: waitListItem.personCount,
          timestamp: waitListItem.timestamp,
          status: waitListItem.status
        });
      } catch (error) {
        console.log(error);
      }
      commit("ADD_TO_WAITLIST", waitListItem);
      // this.dispatch("updateProfile", waitList);
    },
    async updateVenue({ commit }, venue) {
      // Updated to new Data Model
      try {
        await db
          .collection("venues")
          .doc(venue.id)
          .update(venue);
      } catch (error) {
        console.log(error);
      }
      commit("UPDATE_PRESENT", venue.presentCount);
    },
    async addVenue(_, venue) {
      try {
        const res = await db.collection("venues").add(venue);

        var user = firebase.auth().currentUser;
        await db
          .collection("profiles")
          .doc(user.uid)
          .collection("venues")
          .doc(res.id)
          .set({
            name: venue.name
          });

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
    async deleteVenue(_, venue) {
      try {
        // TODO: rewrite that deletevenue will automatically remove its reverence at the profiles relation instead of fetching user profile on venue delete request
        // await db
        //   .collection("profiles")
        //   .doc(venue.user)
        //   .collection("venues")
        //   .doc(venue.venue)
        //   .delete();

        await db
          .collection("venues")
          .doc(venue.id)
          .delete();
      } catch (error) {
        console.error("Error writing document: ", error);
      }
    },
    async updateProfile(_, profile) {
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
