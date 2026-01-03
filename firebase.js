// ===============================
// Firebase Modular Setup
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔐 Your Firebase config (SAFE for frontend)
const firebaseConfig = {
  apiKey: "AIzaSyB-YDJXvYh_GM_k0ijV1MDuMPummF2eAu0",
  authDomain: "dom-portfolio-8bf6b.firebaseapp.com",
  projectId: "dom-portfolio-8bf6b",
  storageBucket: "dom-portfolio-8bf6b.firebasestorage.app",
  messagingSenderId: "437489474898",
  appId: "1:437489474898:web:d7799088689090d2a96e8b",
  measurementId: "G-GHNGBF6W17"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);

// Initialize Firestore
const db = getFirestore(app);

// ===============================
// Contact Form Submission
// ===============================

const form = document.getElementById("contactForm");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !message) {
      alert("Please fill all fields");
      return;
    }

    try {
      await addDoc(collection(db, "messages"), {
        name,
        email,
        message,
        createdAt: serverTimestamp()
      });

      alert("Message sent successfully 🚀");
      form.reset();

    } catch (err) {
      console.error(err);
      alert("Failed to send message. Try again.");
    }
  });
}
