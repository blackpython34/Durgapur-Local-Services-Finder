import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyCI27dyoZpLFHidQirecHxAGSiYrri6LIU",
  authDomain: "durgapur-local-services-f8df7.firebaseapp.com",
  projectId: "durgapur-local-services-f8df7",
  storageBucket: "durgapur-local-services-f8df7.firebasestorage.app",
  messagingSenderId: "543682469046",
  appId: "1:543682469046:web:18f514bf0ef3b910c91a17",
  measurementId: "G-S1N6G8JJGZ"
};
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
