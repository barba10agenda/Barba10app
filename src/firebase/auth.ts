import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { UserAccount } from '../types';
import { handleFirestoreError, OperationType } from './errorHandler';

export const USER_COLLECTION = 'usuarios';

export async function getUserProfile(uid: string): Promise<UserAccount | null> {
  try {
    const userDoc = await getDoc(doc(db, USER_COLLECTION, uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserAccount;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${USER_COLLECTION}/${uid}`);
    return null;
  }
}

export async function saveUserProfile(user: UserAccount): Promise<void> {
  try {
    await setDoc(doc(db, USER_COLLECTION, user.id), user, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${USER_COLLECTION}/${user.id}`);
  }
}

export async function loginWithEmail(email: string, pass: string): Promise<UserAccount | null> {
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  const uid = credential.user.uid;
  let profile = await getUserProfile(uid);
  if (!profile) {
    profile = {
      id: uid,
      name: credential.user.displayName || email.split('@')[0],
      email: email,
      phone: '',
      role: email.includes('admin') || email === 'barbeariajadsonbarber@gmail.com' ? 'admin' : 'client'
    };
    await saveUserProfile(profile);
  }
  return profile;
}

export async function registerWithEmail(name: string, email: string, pass: string, phone: string): Promise<UserAccount> {
  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  const uid = credential.user.uid;
  const newAccount: UserAccount = {
    id: uid,
    name,
    email,
    phone,
    role: email.includes('admin') || email === 'barbeariajadsonbarber@gmail.com' ? 'admin' : 'client'
  };
  await saveUserProfile(newAccount);
  return newAccount;
}

export async function logoutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

export function subscribeAuthState(callback: (user: UserAccount | null) => void) {
  return onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
    if (!fbUser) {
      callback(null);
      return;
    }
    const profile = await getUserProfile(fbUser.uid);
    callback(profile);
  });
}
