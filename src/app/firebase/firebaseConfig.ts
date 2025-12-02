import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  signInWithPopup
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBRvTHsuCLyjz9KzcqiN6g9h8zXNdKrx80",
  authDomain: "ecotrack-a7e85.firebaseapp.com",
  projectId: "ecotrack-a7e85",
  storageBucket: "ecotrack-a7e85.firebasestorage.app",
  messagingSenderId: "94180650865",
  appId: "1:94180650865:web:c65007f7a2e9470b8290d0",
  measurementId: "G-LL3EGHWSH0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" }); // Force account selection

export const facebookProvider = new FacebookAuthProvider();
export const githubProvider = new GithubAuthProvider();
