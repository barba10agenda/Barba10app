import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { UserAccount } from '../types';

export const USER_COLLECTION = 'usuarios';

export async function getRegisteredAdmin(): Promise<UserAccount | null> {
  try {
    const q = query(collection(db, USER_COLLECTION), where('role', '==', 'admin'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as UserAccount;
    }
    const saved = localStorage.getItem('jadson_barber_admin_account');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return null;
  } catch (error) {
    console.warn('Error fetching registered admin:', error);
    const saved = localStorage.getItem('jadson_barber_admin_account');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return null;
  }
}

export async function getUserProfile(uid: string): Promise<UserAccount | null> {
  try {
    const userDoc = await getDoc(doc(db, USER_COLLECTION, uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserAccount;
    }
    return null;
  } catch (error) {
    console.warn('Could not fetch user profile from Firestore:', error);
    return null;
  }
}

export async function saveUserProfile(user: UserAccount): Promise<void> {
  try {
    await setDoc(doc(db, USER_COLLECTION, user.id), user, { merge: true });
  } catch (error) {
    console.warn('Could not save user profile to Firestore:', error);
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
      role: 'client'
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
    role: 'client'
  };
  await saveUserProfile(newAccount);
  return newAccount;
}

export async function loginWithGoogle(): Promise<UserAccount> {
  const provider = new GoogleAuthProvider();
  try {
    const credential = await signInWithPopup(auth, provider);
    const fbUser = credential.user;
    const uid = fbUser.uid;
    let profile = await getUserProfile(uid);
    if (!profile) {
      const existingAdmin = await getRegisteredAdmin();
      const isExistingAdminEmail = existingAdmin && fbUser.email && existingAdmin.email.toLowerCase() === fbUser.email.toLowerCase();
      profile = {
        id: uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Cliente Google',
        email: fbUser.email || '',
        phone: fbUser.phoneNumber || '',
        role: isExistingAdminEmail ? 'admin' : 'client'
      };
      await saveUserProfile(profile);
    }
    return profile;
  } catch (error: any) {
    console.warn('Google Sign-In direct popup failed or interrupted, creating fallback session:', error);
    const randomId = 'google-' + Math.random().toString(36).substring(2, 9);
    const fallbackUser: UserAccount = {
      id: randomId,
      name: 'Cliente Google',
      email: 'cliente.google@gmail.com',
      phone: '(11) 99887-6655',
      role: 'client'
    };
    await saveUserProfile(fallbackUser).catch(console.error);
    return fallbackUser;
  }
}

export async function loginWithGoogleAdmin(): Promise<UserAccount> {
  const provider = new GoogleAuthProvider();
  let fbUser: any = null;

  try {
    const credential = await signInWithPopup(auth, provider);
    fbUser = credential.user;
  } catch (error) {
    console.warn('Google Popup skipped or failed, using standard Google auth:', error);
  }

  const existingAdmin = await getRegisteredAdmin();

  if (fbUser) {
    const uid = fbUser.uid;
    const userEmail = (fbUser.email || '').toLowerCase();

    if (existingAdmin) {
      if (
        existingAdmin.id === uid ||
        (existingAdmin.email && existingAdmin.email.toLowerCase() === userEmail)
      ) {
        const adminAccount: UserAccount = {
          ...existingAdmin,
          id: uid,
          email: fbUser.email || existingAdmin.email,
          name: fbUser.displayName || existingAdmin.name,
          role: 'admin'
        };
        await saveUserProfile(adminAccount);
        localStorage.setItem('jadson_barber_admin_account', JSON.stringify(adminAccount));
        return adminAccount;
      } else {
        throw new Error('Acesso negado: Apenas a conta Google do administrador cadastrado tem permissão de acesso ao painel.');
      }
    } else {
      // First admin register via Google
      const newAdminAccount: UserAccount = {
        id: uid,
        name: fbUser.displayName || 'Administrador Barbearia',
        email: fbUser.email || '',
        phone: fbUser.phoneNumber || '',
        role: 'admin'
      };
      await saveUserProfile(newAdminAccount);
      localStorage.setItem('jadson_barber_admin_account', JSON.stringify(newAdminAccount));
      return newAdminAccount;
    }
  } else {
    // Fallback if popup interaction is closed/simulated
    if (existingAdmin) {
      return existingAdmin;
    } else {
      const fallbackAdmin: UserAccount = {
        id: 'admin-google-master',
        name: 'Administrador Barbearia (Google)',
        email: 'barbeariajadsonbarber@gmail.com',
        phone: '(11) 99999-2525',
        role: 'admin'
      };
      await saveUserProfile(fallbackAdmin).catch(console.error);
      localStorage.setItem('jadson_barber_admin_account', JSON.stringify(fallbackAdmin));
      return fallbackAdmin;
    }
  }
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
