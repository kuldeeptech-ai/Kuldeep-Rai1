import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth';

export interface FirebaseConfigStatus {
  isConfigured: boolean;
  missingKeys: string[];
  projectId?: string;
  authDomain?: string;
}

// User-provided official Firebase configuration for Looks Mens Wear
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCZM3KqKdifJd3nS6lrswD9Qcbw7D8nMRo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "huyt-2f60b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "huyt-2f60b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "huyt-2f60b.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "846658556542",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:846658556542:web:5f1a011bac2466aa5c3e2f",
  measurementId: "G-K3MSK3M3ML"
};

export function getFirebaseConfigStatus(): FirebaseConfigStatus {
  return {
    isConfigured: Boolean(firebaseConfig.apiKey && firebaseConfig.projectId),
    missingKeys: [],
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
  };
}

let app: FirebaseApp;
let firestoreInstance: Firestore;
let authInstance: Auth;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}
firestoreInstance = getFirestore(app);
authInstance = getAuth(app);

export const db: Firestore = firestoreInstance;
export const auth: Auth = authInstance;
export const googleProvider = new GoogleAuthProvider();
export const firebaseApp: FirebaseApp = app;
export const isFirebaseConfigured = true;

export { signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged, type User };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): Error {
  const errMessage = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return new Error(JSON.stringify(errInfo));
}
