import { 
  collection, 
  doc, 
  onSnapshot, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  Unsubscribe 
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { handleFirestoreError, OperationType } from './errorHandler';

export function listenToCollection<T>(
  collectionName: string, 
  onData: (items: T[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const colRef = collection(db, collectionName);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: T[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as T[];
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, collectionName);
    }
  );
}

export async function addDocument<T extends object>(collectionName: string, data: T, customId?: string): Promise<string> {
  try {
    if (customId) {
      await setDoc(doc(db, collectionName, customId), data);
      return customId;
    } else {
      const docRef = await addDoc(collection(db, collectionName), data);
      return docRef.id;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionName);
  }
}

export async function updateDocument<T extends object>(collectionName: string, docId: string, data: Partial<T>): Promise<void> {
  try {
    await updateDoc(doc(db, collectionName, docId), data as any);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${docId}`);
  }
}

export async function deleteDocument(collectionName: string, docId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, collectionName, docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${docId}`);
  }
}
