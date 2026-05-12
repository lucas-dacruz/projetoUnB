import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.APP_ID,
  projectId: process.env.AUTH_DOMAIN,
  storageBucket: process.env.MEASUREMENT_ID,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.PROJECT_ID,
  measurementId: process.env.STORAGE_BUCKET
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { auth };
export const db = getFirestore(app);