// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import { getStorage } from "@firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBB3CN_HBF920CHczQfJ-C-EgzOGO7NTtU",
  authDomain: "ayoo-a92aa.firebaseapp.com",
  projectId: "ayoo-a92aa",
  storageBucket: "ayoo-a92aa.appspot.com",
  messagingSenderId: "365489756515",
  appId: "1:365489756515:web:0871cf035c04724d3a9b56",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
