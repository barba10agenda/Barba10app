import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from './firebaseConfig';

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'configuracoes', 'test_connection'));
    console.log('Firebase Firestore connection verified.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.error('Please check your Firebase configuration or internet connection.');
    }
    return false;
  }
}
