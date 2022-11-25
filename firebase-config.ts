// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import { getStorage } from "@firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBIoVcJt9rLQRyJridmHycQthuydoANdzE",
  authDomain: "sampleproj-80812.firebaseapp.com",
  projectId: "sampleproj-80812",
  storageBucket: "sampleproj-80812.appspot.com",
  messagingSenderId: "703277377730",
  appId: "1:703277377730:web:b9076cb7a1ee302a99335b",
};
// const firebaseConfig = {
//   apiKey: "AIzaSyBB3CN_HBF920CHczQfJ-C-EgzOGO7NTtU",
//   authDomain: "ayoo-a92aa.firebaseapp.com",
//   projectId: "ayoo-a92aa",
//   storageBucket: "ayoo-a92aa.appspot.com",
//   messagingSenderId: "365489756515",
//   appId: "1:365489756515:web:0871cf035c04724d3a9b56",
// };

// const firebaseConfig = {
//   apiKey: "AIzaSyDSgzuCGDG7horL6_7S5jqVQzUiSpbO4DA",
//   authDomain: "newapp-eb1f5.firebaseapp.com",
//   projectId: "newapp-eb1f5",
//   storageBucket: "newapp-eb1f5.appspot.com",
//   messagingSenderId: "896191133889",
//   appId: "1:896191133889:web:33c2f99c9cdf9b2eeefc40",
// };

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
