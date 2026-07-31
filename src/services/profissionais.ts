import { Barber } from '../types';
import { listenToCollection, addDocument, updateDocument, deleteDocument } from '../firebase/firestore';

export const BARBERS_COLLECTION = 'profissionais';

export function subscribeBarbers(onData: (barbers: Barber[]) => void) {
  return listenToCollection<Barber>(BARBERS_COLLECTION, onData);
}

export async function saveBarber(barber: Barber): Promise<string> {
  if (!barber.id) {
    const id = 'brb-' + Math.random().toString(36).substring(2, 9);
    const newBarber = { ...barber, id };
    await addDocument(BARBERS_COLLECTION, newBarber, id);
    return id;
  } else {
    await addDocument(BARBERS_COLLECTION, barber, barber.id);
    return barber.id;
  }
}

export async function removeBarber(id: string): Promise<void> {
  await deleteDocument(BARBERS_COLLECTION, id);
}
