import firebase from "firebase/app";
import "firebase/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyCYZI9ewanrCc_wx0--NNTKipBJ4YkQv9s",
  authDomain: "max30-max100.firebaseapp.com",
  databaseURL: "https://max30-max100.firebaseio.com",
  projectId: "max30-max100",
  storageBucket: "max30-max100.appspot.com",
  messagingSenderId: "30134021170",
  appId: "1:30134021170:web:e0e53bee2955ef1a62202b",
  measurementId: "G-WMWZ6X2JTF"
});

export const db = firebase.firestore();

const { Timestamp, GeoPoint } = firebase.firestore;
export { Timestamp, GeoPoint };
