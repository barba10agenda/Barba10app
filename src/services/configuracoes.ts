import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';

export interface ShopConfig {
  shopName: string;
  phone: string;
  address: string;
  instagram: string;
  openingHours: string;
  primaryColor?: string;
}

export const DEFAULT_SHOP_CONFIG: ShopConfig = {
  shopName: 'Jadson Barber',
  phone: '(11) 99999-2525',
  address: 'Av. Principal, 1000 - Centro',
  instagram: '@jadsonbarber',
  openingHours: 'Terça a Sábado: 08:00 - 20:00'
};

export const CONFIG_COLLECTION = 'configuracoes';
export const MAIN_CONFIG_DOC = 'geral';

export function subscribeShopConfig(onData: (config: ShopConfig) => void) {
  const docRef = doc(db, CONFIG_COLLECTION, MAIN_CONFIG_DOC);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      onData(docSnap.data() as ShopConfig);
    } else {
      onData(DEFAULT_SHOP_CONFIG);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `${CONFIG_COLLECTION}/${MAIN_CONFIG_DOC}`);
  });
}

export async function saveShopConfig(config: ShopConfig): Promise<void> {
  try {
    await setDoc(doc(db, CONFIG_COLLECTION, MAIN_CONFIG_DOC), config, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${CONFIG_COLLECTION}/${MAIN_CONFIG_DOC}`);
  }
}
