// src/config/firebase.js
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();
const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!key) {
  throw new Error("❌ FIREBASE_SERVICE_ACCOUNT_KEY is missing in env");
}

// allow both single-line JSON string or already parsed object
const serviceAccount = typeof key === "string" ? JSON.parse(key) : key;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const firebaseAdmin = admin;
