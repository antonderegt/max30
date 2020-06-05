import Vue from "vue";
import Vuex from "vuex";
import { vuexfireMutations, firestoreAction } from "vuexfire";
import { db, Timestamp } from "@/db";
import geohash from "ngeohash";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    waitList: [],
    venueListGeoBounded: [],
    venue: {},
    user: {
      loggedIn: false,
      data: null,
      profile: null
    },
    myVenues: [],
    waitListsByUser: [],
    snackbar: {
      show: false,
      text: "",
      color: ""
    },
    waitListInFrontOfUser: {}
  },
  mutations: {
    ...vuexfireMutations,
    SET_LOGGED_IN(state, value) {
      state.user.loggedIn = value;
    },
    SET_LOGGED_OUT(state) {
      state.user.loggedIn = false;
      state.user.profile = null;
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
    bindGeoBoundedVenues: firestoreAction((bindFirestoreRef, location) => {
      const kmPerLat = 111;
      const kmPerLon = 150 - 1.6 * location.latitude;
      const lat = 1 / kmPerLat;
      const lon = 1 / kmPerLon;

      const lowerLat = location.latitude - lat * location.distance;
      const lowerLon = location.longitude - lon * location.distance;

      const upperLat = location.latitude + lat * location.distance;
      const upperLon = location.longitude + lon * location.distance;

      const lower = geohash.encode(lowerLat, lowerLon);
      const upper = geohash.encode(upperLat, upperLon);

      return bindFirestoreRef.bindFirestoreRef(
        "venueListGeoBounded",
        db
          .collection("venues")
          .where("location.geohash", ">", lower)
          .where("location.geohash", "<", upper)
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
    bindWaitListInFrontOfUser: firestoreAction(
      (bindFirestoreRef, waitListItem) => {
        return bindFirestoreRef.bindFirestoreRef(
          "waitListInFrontOfUser",
          db
            .collection("waitlists")
            .where("venueID", "==", waitListItem.venueID)
            .where("status", "==", "waiting")
            .where("timestamp", "<", waitListItem.timestamp)
        );
      }
    ),
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
      venue.location.geohash = geohash.encode(
        venue.location.geo.latitude,
        venue.location.geo.longitude
      );
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
      venue.location.geohash = geohash.encode(
        venue.location.geo.latitude,
        venue.location.geo.longitude
      );
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
          return true;
        } else {
          console.log("No such document!");
          return false;
        }
      } catch (error) {
        console.log("Error getting document:", error);
      }
    },
    async deleteVenue(_, venue) {
      try {
        // TODO: waitListItems still exist after delete (feature? or bug?)
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
      if (user === null) {
        commit("SET_LOGGED_OUT");
        return;
      }

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
