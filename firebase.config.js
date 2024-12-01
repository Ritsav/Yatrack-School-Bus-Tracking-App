// firebaseConfig.js
// Refer to the firebase's documentation for more detail regarding these methods.
// Required references are in the app's documentation.

// Used Firebase methods imports
import { initializeApp } from "firebase/app";
import { signInWithEmailAndPassword, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore, doc, getDoc, onSnapshot } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Web app's Firebase configuration
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-app-id.firebaseapp.com",
    databaseURL: "https://your-app-id.firebaseio.com",
    projectId: "your-app-id",
    storageBucket: "your-app-id.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id",
    measurementId: "your-measurement-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Configure Firebase Auth with React Native persistence
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage), // Here the method getReactNativePersistence maps Firebase's storage requirements to AsyncStorage
});

// Initialize Firestore and Database
const firestore = getFirestore(app);
const database = getDatabase(app);

// Exporting methods to use in files which import them
export { onSnapshot, auth, firestore, database, signInWithEmailAndPassword, doc, getDoc };