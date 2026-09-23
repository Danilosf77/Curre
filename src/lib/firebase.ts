import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfigFile from '../../firebase-applet-config.json';
import { UserProfile, OptimizedResume } from '../types';

// Initialize Firebase App with support for VITE_ environment variables or config file
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigFile.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigFile.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigFile.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigFile.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigFile.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigFile.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfigFile.measurementId || '',
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || firebaseConfigFile.firestoreDatabaseId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
// Use specified databaseId if present, else default
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Test connection on boot (non-blocking)
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore is currently in offline mode.');
    }
  }
}
testFirestoreConnection();

/**
 * Sign in with Google Popup
 */
export async function loginWithGoogle(): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  const profile: UserProfile = {
    id: user.uid,
    name: user.displayName || user.email?.split('@')[0] || 'Usuário',
    email: user.email || '',
    avatarUrl: user.photoURL || undefined,
    provider: 'google',
    createdAt: new Date().toISOString(),
  };

  // Upsert user profile to Firestore
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, profile, { merge: true });
  } catch (err) {
    console.error('Error saving user profile to Firestore:', err);
  }

  return profile;
}

/**
 * Sign in or Sign up with Email
 */
export async function loginWithEmail(name: string, email: string): Promise<UserProfile> {
  // Use a predictable password pattern or create account
  const standardPass = `Curre@${email.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  let user: FirebaseUser;

  try {
    // Try sign in first
    const res = await signInWithEmailAndPassword(auth, email, standardPass);
    user = res.user;
  } catch (err: any) {
    if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
      // Create new user
      const createRes = await createUserWithEmailAndPassword(auth, email, standardPass);
      user = createRes.user;
      if (name) {
        await updateProfile(user, { displayName: name });
      }
    } else {
      throw err;
    }
  }

  const profile: UserProfile = {
    id: user.uid,
    name: name || user.displayName || email.split('@')[0] || 'Usuário',
    email: user.email || email,
    avatarUrl: user.photoURL || undefined,
    provider: 'email',
    createdAt: new Date().toISOString(),
  };

  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, profile, { merge: true });
  } catch (err) {
    console.error('Error saving user profile to Firestore:', err);
  }

  return profile;
}

/**
 * Sign Out
 */
export async function logoutFirebase(): Promise<void> {
  await signOut(auth);
}

/**
 * Save resume to user's Firestore cloud storage
 */
export async function saveResumeToCloud(userId: string, resume: OptimizedResume): Promise<void> {
  if (!userId) return;
  const resumeId = 'current_resume';
  const resumeRef = doc(db, 'users', userId, 'resumes', resumeId);

  await setDoc(
    resumeRef,
    {
      id: resumeId,
      userId,
      targetRole: resume.targetRole || 'Profissional',
      templateStyle: resume.templateStyle || 'liquid-modern',
      language: resume.language || 'pt',
      resumeData: JSON.stringify(resume),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

/**
 * Load latest resume from user's Firestore cloud storage
 */
export async function loadResumeFromCloud(userId: string): Promise<OptimizedResume | null> {
  if (!userId) return null;
  try {
    const resumeId = 'current_resume';
    const resumeRef = doc(db, 'users', userId, 'resumes', resumeId);
    const snap = await getDoc(resumeRef);

    if (snap.exists()) {
      const data = snap.data();
      if (data?.resumeData) {
        return JSON.parse(data.resumeData) as OptimizedResume;
      }
    }
  } catch (err) {
    console.error('Error loading resume from Firestore:', err);
  }
  return null;
}
