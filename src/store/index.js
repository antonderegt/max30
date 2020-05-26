import Vue from "vue";
import Vuex from "vuex";
import { vuexfireMutations, firestoreAction } from "vuexfire";
import { db, Timestamp } from "@/db";
import firebase from "firebase/app";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    waitList: [],
    venueListAll: [],
    venueListGeoBounded: [],

    venue: {},
    user: {
      loggedIn: false,
      data: null,
      profile: null
    },
    myVenues: [],
    waitListsByUser: [],
    chat: [],
    snackbar: {
      show: false,
      text: ""
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
    ADD_TO_WAITLIST(state, waitList) {
      state.waitList.push(waitList);
    },
    UPDATE_PRESENT(state, newPresent) {
      state.venue.presentCount = newPresent;
    },
    SET_SNACKBAR(state, snackbar) {
      state.snackbar = snackbar;
    }
  },
  actions: {
    bindVenue: firestoreAction((bindFirestoreRef, id) => {
      return bindFirestoreRef.bindFirestoreRef(
        "venue",
        db.collection("venues").doc(id)
      );
    }),
    // bindAllVenues: firestoreAction(bindFirestoreRef => {
    //   return bindFirestoreRef.bindFirestoreRef(
    //     "venueListAll",
    //     db.collection("venues")
    //   );
    // }),
    bindGeoBoundedVenues: firestoreAction((bindFirestoreRef, boundingBox) => {
      const lowerBound = new firebase.firestore.GeoPoint(
        boundingBox[0].latitude,
        boundingBox[0].longitude
      );
      const upperBound = new firebase.firestore.GeoPoint(
        boundingBox[1].latitude,
        boundingBox[1].longitude
      );

      return bindFirestoreRef.bindFirestoreRef(
        "venueListGeoBounded",
        db
          .collection("venues")
          .where("location.geo", ">", lowerBound)
          .where("location.geo", "<", upperBound)
      );
    }),
    bindWaitList: firestoreAction((bindFirestoreRef, venueID) => {
      return bindFirestoreRef.bindFirestoreRef(
        "waitList",
        db
          .collection("waitlists")
          .where("venueID", "==", venueID)
          .where("status", "==", "waiting")
          .orderBy("timestamp")
      );
    }),
    bindWaitListsByUser: firestoreAction((bindFirestoreRef, userID) => {
      return bindFirestoreRef.bindFirestoreRef(
        "waitListsByUser",
        db.collection("waitlists").where("userID", "==", userID)
        //TODO: needs relation to venue to also query venue info or waitinglist should be an object property of venue itself
      );
    }),
    bindMyVenues: firestoreAction((bindFirestoreRef, userID) => {
      return bindFirestoreRef.bindFirestoreRef(
        "myVenues",
        db.collection("venues").where(`owners.${userID}`, "==", true)
      );
    }),
    bindChat: firestoreAction((bindFirestoreRef, chat) => {
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
    async getVenueName(_, venueID) {
      const docRef = db.collection("venues").doc(venueID);
      try {
        const doc = await docRef.get();
        if (doc.exists) {
          return doc.data().name;
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.log("Error getting document:", error);
      }
    },
    async getWaitListInFrontOfUser(_, waitListItem) {
      const doc = await db
        .collection("waitlists")
        .where("venueID", "==", waitListItem.venueID)
        .where("timestamp", "<", waitListItem.timestamp)
        .get();

      if (!doc.empty) {
        return doc.docs;
      } else {
        console.log("No such document!");
      }
    },
    async joinWaitList({ commit }, waitListItem) {
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
    },
    async updateVenue({ commit }, venue) {
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
        await db.collection("venues").add(venue);
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
        // TODO: chats and waitListItems still exist after delete (feature? or bug?)
        await db
          .collection("venues")
          .doc(venue.id)
          .delete();
      } catch (error) {
        console.error("Error deleting document: ", error);
      }
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
    },
    setSnackbar({ commit }, snackbar) {
      commit("SET_SNACKBAR", snackbar);
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
