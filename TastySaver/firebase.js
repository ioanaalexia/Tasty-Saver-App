// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {getStorage} from "firebase/storage"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "key-removed-for-privacy",
  authDomain: "tastysaver.firebaseapp.com",
  projectId: "tastysaver",
  storageBucket: "tastysaver.firebasestorage.app",
  messagingSenderId: "962707159460",
  appId: "1:962707159460:web:c4ccf41a18b90eb9852931",
  measurementId: "G-CY3CWXX72D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
