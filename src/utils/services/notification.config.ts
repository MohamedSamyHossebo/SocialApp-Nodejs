import admin from "firebase-admin";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const serviceAccount = JSON.parse(
  readFileSync(
    resolve(
      "./src/config/social-app-7c506-firebase-adminsdk-fbsvc-09d37e1a58.json",
    ),
    "utf-8",
  ),
);
const firebaseapp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default firebaseapp;
