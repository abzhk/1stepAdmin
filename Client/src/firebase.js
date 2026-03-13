import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "step-1d272.firebaseapp.com",
  projectId: "step-1d272",
  storageBucket: "step-1d272.appspot.com",
  messagingSenderId: "833106800742",
  appId: "1:833106800742:web:946fa4a9b0a173590f3da7",
};

export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
