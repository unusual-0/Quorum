// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCeUlWFiQtAzDRB__m4NzTzZd3hAEquwCQ",
  authDomain: "quorum-1.firebaseapp.com",
  databaseURL: "https://quorum-1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "quorum-1",
  storageBucket: "quorum-1.firebasestorage.app",
  messagingSenderId: "948804172041",
  appId: "1:948804172041:web:ec0f354abd3bf5b13dbbd8",
  measurementId: "G-32G89JDGQ7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
