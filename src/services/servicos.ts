import { Service } from '../types';
import { listenToCollection, addDocument, updateDocument, deleteDocument } from '../firebase/firestore';

export const SERVICES_COLLECTION = 'servicos';

export function subscribeServices(onData: (services: Service[]) => void) {
  return listenToCollection<Service>(SERVICES_COLLECTION, onData);
}

export async function saveService(service: Service): Promise<string> {
  if (!service.id) {
    const id = 'srv-' + Math.random().toString(36).substring(2, 9);
    const newService = { ...service, id };
    await addDocument(SERVICES_COLLECTION, newService, id);
    return id;
  } else {
    await addDocument(SERVICES_COLLECTION, service, service.id);
    return service.id;
  }
}

export async function removeService(id: string): Promise<void> {
  await deleteDocument(SERVICES_COLLECTION, id);
}
