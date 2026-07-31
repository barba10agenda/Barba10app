import { UserAccount } from '../types';
import { listenToCollection } from '../firebase/firestore';

export const USER_COLLECTION = 'usuarios';

export function subscribeClients(onData: (clients: UserAccount[]) => void) {
  return listenToCollection<UserAccount>(USER_COLLECTION, (users) => {
    const clientsOnly = users.filter((u) => u.role === 'client');
    onData(clientsOnly);
  });
}
