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
    searchLocation: "",
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
    },
    ADD_GEO_BOUNDED_VENUES(state, venues) {
      state.venueListGeoBounded = venues;
    },
    SET_SEARCH_LOCATION(state, location) {
      state.searchLocation = location;
    }
  },
  actions: {
    bindVenue: firestoreAction((bindFirestoreRef, id) => {
      return bindFirestoreRef.bindFirestoreRef(
        "venue",
        db.collection("venues").doc(id)
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
    setSearchLocation({ commit }, location) {
      commit("SET_SEARCH_LOCATION", location);
    },
    async getGeoBoundedVenues({ commit }, location) {
      const center = geohash
        .encode(location.latitude, location.longitude)
        .slice(0, -location.distance);
      let neighbors = geohash.neighbors(center);
      neighbors.push(center);

      let venueList = [];

      await Promise.all(
        neighbors.map(async center => {
          try {
            const res = await db
              .collection("venues")
              .where("location.geohash", ">", center)
              .where("location.geohash", "<", center + "~")
              .get();
            if (!res?.empty) {
              res.docs.forEach(v => {
                const venue = v.data();
                venue.id = v.id;
                venueList.push(venue);
              });
            }
          } catch (error) {
            console.log(error);
          }
        })
      );

      commit("ADD_GEO_BOUNDED_VENUES", venueList);
    },
    async updateWaitList(_, waitListItem) {
      try {
        await db
          .collection("waitlists")
          .doc(waitListItem.waitListID)
          .update({
            status: waitListItem.status,
            updateTimestamp: Timestamp.fromDate(new Date())
          });
      } catch (error) {
        console.log(error);
      }
    },
    async updateAwaitingArrival(_, waitListID) {
      try {
        await db
          .collection("waitlists")
          .doc(waitListID)
          .update({
            awaitingArrival: true,
            updateTimestamp: Timestamp.fromDate(new Date())
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
    async getUserName(_, userID) {
      const docRef = db.collection("profiles").doc(userID);
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
          status: waitListItem.status,
          awaitingArrival: waitListItem.awaitingArrival
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
    async updateProfileName(_, profile) {
      try {
        await db
          .collection("profiles")
          .doc(profile.userID)
          .update({
            name: profile.name
          });
      } catch (error) {
        console.error("Error writing document: ", error);
      }
    },
    async deleteProfile(_, userID) {
      try {
        await db
          .collection("profiles")
          .doc(userID)
          .delete();
      } catch (error) {
        console.error("Error writing document: ", error);
      }
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
