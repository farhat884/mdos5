import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC6dM5UrraX2PIst_UwdPXNP16EkTHPK4Y",
  authDomain: "mdo2-681ad.firebaseapp.com",
  projectId: "mdo2-681ad",
  storageBucket: "mdo2-681ad.firebasestorage.app",
  messagingSenderId: "679530889634",
  appId: "1:679530889634:web:807cd3f7b0e0d26dbfb2fb",
  measurementId: "G-CHM5853B8P"
};

const app = initializeApp(firebaseConfig);
console.log("✅ Firebase connected");

export const db = getFirestore(app);