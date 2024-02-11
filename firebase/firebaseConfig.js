import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getFirestore } from "firebase/firestore";
// https://firebase.google.com/docs/web/setup#available-libraries


// Firebase configuration TODO: Add to .ENV vars
const firebaseConfig = {
  apiKey: "AIzaSyBlIKZAjYW3HEICh8rQqRP-TgrTTWxXFOo",
  authDomain: "vibeapp-fb-test.firebaseapp.com",
  projectId: "vibeapp-fb-test",
  storageBucket: "vibeapp-fb-test.appspot.com",
  messagingSenderId: "1075693327599",
  appId: "1:1075693327599:web:492edf47a598294849f71a"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Initialize Firebase Authentication and get a reference to the service
export const db = getFirestore(app); // Initialize Cloud Firestore and get a reference to the service

