import { BlockedSlot } from '../types';
import { listenToCollection, addDocument, deleteDocument } from '../firebase/firestore';

export const BLOCKED_SLOTS_COLLECTION = 'horarios';

export function subscribeBlockedSlots(onData: (slots: BlockedSlot[]) => void) {
  return listenToCollection<BlockedSlot>(BLOCKED_SLOTS_COLLECTION, onData);
}

export function generateSlotDocId(slot: BlockedSlot): string {
  const barberPart = slot.barberId ? `_${slot.barberId}` : '_all';
  return `${slot.date}_${slot.timeSlot.replace(':', '')}${barberPart}`;
}

export async function toggleBlockedSlot(slot: BlockedSlot, currentSlots: BlockedSlot[]): Promise<void> {
  const docId = generateSlotDocId(slot);
  const exists = currentSlots.some(
    (b) => b.date === slot.date && b.timeSlot === slot.timeSlot && b.barberId === slot.barberId
  );

  if (exists) {
    await deleteDocument(BLOCKED_SLOTS_COLLECTION, docId);
  } else {
    await addDocument(BLOCKED_SLOTS_COLLECTION, slot, docId);
  }
}
