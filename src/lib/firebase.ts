import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
  ActionCodeSettings,
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
import { UserProfile, OptimizedResume } from '../types';

// Web app's Firebase configuration for com-freitas-curre-a5946
const firebaseConfig = {
  apiKey: "AIzaSyDgOHfFR6qkLSvH09_R1Z2QrkZR3ikhrhA",
  authDomain: "com-freitas-curre-a5946.firebaseapp.com",
  projectId: "com-freitas-curre-a5946",
  storageBucket: "com-freitas-curre-a5946.firebasestorage.app",
  messagingSenderId: "440798568410",
  appId: "1:440798568410:web:e587c8de74327aec58aae3"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
// Initialize Firestore for standard (default) database
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const EMAIL_SIGNIN_STORAGE_KEY = 'curre_email_for_signin';

export function getStoredEmailForSignIn(): string | null {
  try {
    return localStorage.getItem(EMAIL_SIGNIN_STORAGE_KEY);
  } catch (e) {
    console.error('Error reading stored email for sign-in:', e);
    return null;
  }
}

export function setStoredEmailForSignIn(email: string): void {
  try {
    localStorage.setItem(EMAIL_SIGNIN_STORAGE_KEY, email.trim().toLowerCase());
  } catch (e) {
    console.error('Error storing email for sign-in:', e);
  }
}

export function clearStoredEmailForSignIn(): void {
  try {
    localStorage.removeItem(EMAIL_SIGNIN_STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing stored email for sign-in:', e);
  }
}

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
    isAnonymous: false,
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
 * Resolves the continueUrl for Firebase Auth Email Link.
 * Ensures the preview URL or production domain is used, preventing localhost leakage.
 */
export function getContinueUrl(): string {
  // If in browser and on a real public hostname (not localhost or 127.0.0.1)
  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin;
    if (!origin.includes('localhost') && !origin.includes('127.0.0.1') && !origin.includes('0.0.0.0')) {
      return origin + (window.location.pathname || '/');
    }
  }

  // If running inside AI Studio preview or localhost dev, use configured public APP_URL
  const appUrl = (import.meta.env.VITE_APP_URL || '').trim();
  if (appUrl && appUrl !== 'MY_APP_URL' && !appUrl.includes('localhost')) {
    return appUrl.endsWith('/') ? appUrl : `${appUrl}/`;
  }

  // Fallback to current browser URL or AI Studio default preview URL
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin + (window.location.pathname || '/');
  }
  return 'https://ais-dev-zj4r5tjenuio5pwjcmrafg-69905515999.us-east1.run.app/';
}

/**
 * Send passwordless Email Sign-In Link (Firebase Email Link)
 */
export async function sendEmailSignInLink(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();

  // Return URL: Keep exact origin and path, without extraneous parameters or personal data
  const returnUrl = getContinueUrl();

  const actionCodeSettings: ActionCodeSettings = {
    url: returnUrl,
    handleCodeInApp: true,
  };

  await sendSignInLinkToEmail(auth, cleanEmail, actionCodeSettings);

  // Store the email locally on this device so completing login is seamless
  setStoredEmailForSignIn(cleanEmail);
}

/**
 * Check if the given URL is an incoming Firebase Email Link
 */
export function isEmailSignInLink(link: string = window.location.href): boolean {
  return isSignInWithEmailLink(auth, link);
}

/**
 * Complete passwordless sign in with the incoming email link
 */
export async function completeEmailLinkSignIn(
  email: string,
  link: string = window.location.href
): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();
  const res = await signInWithEmailLink(auth, cleanEmail, link);
  const user = res.user;

  // Build authentic UserProfile from real Firebase User
  const profile: UserProfile = {
    id: user.uid,
    name: user.displayName || cleanEmail.split('@')[0] || 'Usuário',
    email: user.email || cleanEmail,
    avatarUrl: user.photoURL || undefined,
    provider: 'email',
    createdAt: new Date().toISOString(),
    isAnonymous: false,
  };

  // Upsert profile in Firestore with merge: true to preserve existing records
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, profile, { merge: true });
  } catch (err) {
    console.error('Error saving user profile to Firestore:', err);
  }

  // Clear pending sign-in email from storage
  clearStoredEmailForSignIn();

  // Clean sign-in link parameters from browser address bar without breaking SPA navigation
  try {
    window.history.replaceState(null, '', window.location.pathname);
  } catch (e) {
    console.warn('Error cleaning URL parameters after sign-in:', e);
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
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.isAnonymous || !userId || currentUser.uid !== userId) {
    console.warn('Cannot save resume to cloud: User is not authenticated');
    return;
  }
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
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.isAnonymous || !userId || currentUser.uid !== userId) {
    return null;
  }
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
