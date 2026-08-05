import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';

export interface ShopConfig {
  shopName: string;
  shopTagline?: string;
  phone: string;
  address: string;
  instagram: string;
  openingHours: string;
  primaryColor?: string;

  // Header Logo Replacement Configuration (500x500 image)
  useCustomLogo?: boolean;
  logoUrl?: string;
  logoOriginalUrl?: string;
  logoBgRemoval?: 'none' | 'remove-black' | 'remove-white';
  logoPosition?: 'left' | 'center' | 'right';
  logoSize?: number;

  // Client Home Page / Hero Reception Config (Screenshots 1 & 2)
  heroBadge?: string;
  heroTitleLine1?: string;
  heroTitleLine2?: string;
  heroDescription?: string;
  ctaButtonText?: string;
  ctaSubtext?: string;
  highlightsPill1?: string;
  highlightsPill2?: string;
  highlightsPill3?: string;
  highlightsPill4?: string;
  bannerTitle?: string;
  bannerDescription?: string;
  bannerButtonText?: string;
}

export const DEFAULT_SHOP_CONFIG: ShopConfig = {
  shopName: 'JADSON BARBER',
  shopTagline: 'ATENDIMENTO SLIM VIP',
  useCustomLogo: false,
  logoUrl: '',
  logoOriginalUrl: '',
  logoBgRemoval: 'none',
  logoPosition: 'left',
  logoSize: 40,
  phone: '(11) 99999-2525',
  address: 'Av. Principal, 1000 - Centro',
  instagram: '@jadsonbarber',
  openingHours: 'Terça a Sábado: 08:00 - 20:00',
  heroBadge: 'PREMIUM EXPERIENCE',
  heroTitleLine1: 'O ESTILO QUE',
  heroTitleLine2: 'VOCÊ MERECE.',
  heroDescription: 'Agende seu horário com o mestre Jadson. Cortes clássicos, degradês modernos, visagismo e barba com toalha quente em ambiente exclusivo.',
  ctaButtonText: 'AGENDAR AGORA',
  ctaSubtext: 'RESERVA SIMPLES & RÁPIDA',
  highlightsPill1: 'Atendimento Exclusivo',
  highlightsPill2: 'Visagismo Slim Custom',
  highlightsPill3: 'Toalha Quente & Vapor',
  highlightsPill4: 'Pontualidade VIP',
  bannerTitle: 'PRONTO PARA RENOVAR SEU VISUAL?',
  bannerDescription: 'Inicie nosso Agendamento Slim em 4 etapas simples: escolha data e horário, barbeiro, serviços e confirme seu resumo.',
  bannerButtonText: 'INICIAR AGENDAMENTO AGORA'
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
