import firebase from "firebase/app";
import "firebase/storage";
import "firebase/firestore";
import "firebase/auth";
import "firebase/messaging";
import { FirebaseConfig } from "./keys";

firebase.initializeApp(FirebaseConfig);

const firestore = firebase.firestore();

firestore.enablePersistence();

const storage = firebase.storage().ref();
const provider = new firebase.auth.GoogleAuthProvider();
const auth = firebase.auth();
const per = firebase.auth.Auth.Persistence.LOCAL;

const messaging = firebase.messaging();

messaging.usePublicVapidKey(
  "BCAdYrANLO8IElSjii7QiHq3elxI1YySxHKEJYHuhRBEPFzPLpDCbYiorlGjtOWTXE7zCZ4yxA0k0vpTJ4FohGA"
);

export { firestore, storage, provider, auth, per, messaging };
