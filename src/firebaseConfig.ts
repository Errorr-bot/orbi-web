import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAbhdiJX8wk4a3EeCJfYA7EFOEv_Np1ykA",
  authDomain:  "orbi-58e98.firebaseapp.com",
  projectId: "orbi-58e98",
  storageBucket: "orbi-58e98.firebasestorage.app",
  messagingSenderId: "1050957233561",
  appId: "1:1050957233561:web:e6d0fa9f47082d7efc2708"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
