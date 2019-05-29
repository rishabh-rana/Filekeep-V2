import firebase from "firebase/app";
import "firebase/storage";
import "firebase/firestore";
import "firebase/auth";
import "firebase/messaging";
import "firebase/functions";
import { FirebaseConfig } from "./keys";

firebase.initializeApp(FirebaseConfig);

// firebase.functions().useFunctionsEmulator("http://localhost:5001");

firebase.firestore().settings({
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});

firebase.firestore().enablePersistence();

const firestore = firebase.firestore();

const storage = firebase.storage().ref();
const provider = new firebase.auth.GoogleAuthProvider();
const auth = firebase.auth();
const per = firebase.auth.Auth.Persistence.LOCAL;

const functions = firebase.functions();

const messaging = firebase.messaging();

messaging.usePublicVapidKey(
  "BCAdYrANLO8IElSjii7QiHq3elxI1YySxHKEJYHuhRBEPFzPLpDCbYiorlGjtOWTXE7zCZ4yxA0k0vpTJ4FohGA"
);

export { firestore, storage, provider, auth, per, messaging, functions };
