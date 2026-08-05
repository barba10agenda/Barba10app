import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

function getDbInstance() {
  if (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)') {
    try {
      const dbWithId = getFirestore(app, firebaseConfig.firestoreDatabaseId);
      if (dbWithId) return dbWithId;
    } catch (e) {
      console.warn('Fallback to default Firestore database:', e);
    }
  }
  return getFirestore(app);
}

export const db = getDbInstance();
export const auth = getAuth(app);

