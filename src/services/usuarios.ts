import { UserAccount } from '../types';
import { listenToCollection, addDocument, updateDocument, deleteDocument } from '../firebase/firestore';

export const USER_COLLECTION = 'usuarios';

export function subscribeAllUsers(onData: (users: UserAccount[]) => void) {
  return listenToCollection<UserAccount>(USER_COLLECTION, onData);
}

export async function saveUserAccount(user: UserAccount): Promise<void> {
  await addDocument(USER_COLLECTION, user, user.id);
}

export async function updateUserAccount(id: string, partial: Partial<UserAccount>): Promise<void> {
  await updateDocument<UserAccount>(USER_COLLECTION, id, partial);
}

export async function deleteUserAccount(id: string): Promise<void> {
  await deleteDocument(USER_COLLECTION, id);
}
