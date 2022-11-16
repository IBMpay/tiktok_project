// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import { getStorage } from "@firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDhInbfrTJLiQP1k7YLcvewQiDn8oaZbW4",
  authDomain: "tiktok-blockchain.firebaseapp.com",
  projectId: "tiktok-blockchain",
  storageBucket: "tiktok-blockchain.appspot.com",
  messagingSenderId: "270239591727",
  appId: "1:270239591727:web:581e1653c8b20d543205da",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
