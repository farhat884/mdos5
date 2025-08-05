import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDYqyaY6hbvnt-kTsm2AWYiVgODAMuBjeg",
  authDomain: "kuota-siswa.firebaseapp.com",
  projectId: "kuota-siswa",
  storageBucket: "kuota-siswa.firebasestorage.app",
  messagingSenderId: "844268543196",
  appId: "1:844268543196:web:72ba8975912832d4d86819",
  measurementId: "G-XT1RDD24QD"
};

const app = initializeApp(firebaseConfig);
console.log("✅ Firebase connected");

export const db = getFirestore(app);
