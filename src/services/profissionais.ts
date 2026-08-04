import { Barber } from '../types';
import { listenToCollection, addDocument, deleteDocument } from '../firebase/firestore';
import { compressBase64Image } from '../utils/imageCompressor';

export const BARBERS_COLLECTION = 'profissionais';

export function subscribeBarbers(onData: (barbers: Barber[]) => void) {
  return listenToCollection<Barber>(BARBERS_COLLECTION, onData);
}

export async function saveBarber(barber: Barber): Promise<string> {
  let cleanAvatar = barber.avatar || barber.avatarUrl || '';
  let cleanAvatarUrl = barber.avatarUrl || barber.avatar || '';

  if (cleanAvatar.startsWith('data:image')) {
    cleanAvatar = await compressBase64Image(cleanAvatar, 400, 400, 0.75);
    cleanAvatarUrl = cleanAvatar;
  }

  const barberToSave = {
    ...barber,
    avatar: cleanAvatar,
    avatarUrl: cleanAvatarUrl
  };

  if (!barberToSave.id) {
    const id = 'brb-' + Math.random().toString(36).substring(2, 9);
    const newBarber = { ...barberToSave, id };
    await addDocument(BARBERS_COLLECTION, newBarber, id);
    return id;
  } else {
    await addDocument(BARBERS_COLLECTION, barberToSave, barberToSave.id);
    return barberToSave.id;
  }
}

export async function removeBarber(id: string): Promise<void> {
  await deleteDocument(BARBERS_COLLECTION, id);
}

