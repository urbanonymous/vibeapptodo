import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBJmabFuhhTXkZVbdo2Z0XmsM2g-KAXdq8",
  authDomain: "vibeapptodo.firebaseapp.com",
  projectId: "vibeapptodo",
  storageBucket: "vibeapptodo.firebasestorage.app",
  messagingSenderId: "36602022114",
  appId: "1:36602022114:web:7c2b19e25d1605c83736bb"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

