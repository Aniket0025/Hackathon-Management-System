// Firebase client initialization
// Make sure to set NEXT_PUBLIC_ envs only for client safe values.
import { initializeApp, getApps, FirebaseApp } from "firebase/app"
import { getAnalytics, isSupported } from "firebase/analytics"

function required(name: string, value: string | undefined) {
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing Firebase env: ${name}. Add it to your frontend .env.local as NEXT_PUBLIC_*. ` +
      `See https://firebase.google.com/docs/web/learn-more#config-object`
    )
  }
  return value
}

const firebaseConfig = {
  apiKey: required("NEXT_PUBLIC_FIREBASE_API_KEY", process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: required("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: required("NEXT_PUBLIC_FIREBASE_PROJECT_ID", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: required("NEXT_PUBLIC_FIREBASE_APP_ID", process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

export const app: FirebaseApp = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig)

// Optional: initialize analytics only in browser and if supported
export async function initAnalytics() {
  if (typeof window === "undefined") return
  try {
    const ok = await isSupported()
    if (ok) getAnalytics(app)
  } catch {}
}
