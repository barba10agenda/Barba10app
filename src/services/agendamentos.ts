import { Appointment, AppointmentStatus } from '../types';
import { listenToCollection, addDocument, updateDocument, deleteDocument } from '../firebase/firestore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';

export const APPOINTMENTS_COLLECTION = 'agendamentos';

export function subscribeAppointments(onData: (appointments: Appointment[]) => void) {
  return listenToCollection<Appointment>(APPOINTMENTS_COLLECTION, (items) => {
    // Sort by createdAt or date
    const sorted = items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    onData(sorted);
  });
}

export async function checkSlotIsBooked(date: string, timeSlot: string, barberId?: string): Promise<boolean> {
  try {
    const colRef = collection(db, APPOINTMENTS_COLLECTION);
    const q = query(
      colRef, 
      where('date', '==', date), 
      where('timeSlot', '==', timeSlot),
      where('status', 'in', ['confirmado', 'pendente'])
    );
    const snapshot = await getDocs(q);
    if (barberId) {
      return snapshot.docs.some(d => d.data().barberId === barberId);
    }
    return !snapshot.empty;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, APPOINTMENTS_COLLECTION);
    return false;
  }
}

export async function createAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt'>): Promise<string> {
  const isBooked = await checkSlotIsBooked(appointmentData.date, appointmentData.timeSlot, appointmentData.barberId);
  if (isBooked) {
    throw new Error('Horário já agendado por outro cliente. Por favor escolha outro horário.');
  }

  const customId = 'apt-' + Math.random().toString(36).substring(2, 9);
  const newAppointment: Appointment = {
    ...appointmentData,
    id: customId,
    createdAt: new Date().toISOString()
  };

  await addDocument(APPOINTMENTS_COLLECTION, newAppointment, customId);
  return customId;
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<void> {
  await updateDocument<Appointment>(APPOINTMENTS_COLLECTION, id, { status });
}

export async function cancelAppointment(id: string): Promise<void> {
  await updateAppointmentStatus(id, 'cancelado');
}

export async function removeAppointment(id: string): Promise<void> {
  await deleteDocument(APPOINTMENTS_COLLECTION, id);
}
