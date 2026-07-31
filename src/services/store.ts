import { Appointment, Barber, Service, BlockedSlot, UserAccount } from '../types';
import { db } from '../firebase/firebaseConfig';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { subscribeAppointments, createAppointment, updateAppointmentStatus, removeAppointment } from './agendamentos';
import { subscribeServices, saveService, removeService } from './servicos';
import { subscribeBarbers, saveBarber, removeBarber } from './profissionais';
import { subscribeBlockedSlots, toggleBlockedSlot } from './horarios';
import { subscribeShopConfig, saveShopConfig, DEFAULT_SHOP_CONFIG, ShopConfig } from './configuracoes';
import { saveUserAccount } from './usuarios';

// Default initial services
export const DEFAULT_SERVICES: Service[] = [
  {
    id: 'srv-1',
    name: 'Corte Slim Degradê',
    price: 45,
    durationMinutes: 30,
    description: 'Corte moderno com acabamento na navalha e finalização com pomada de alta fixação.',
    category: 'corte',
    popular: true,
    iconName: 'Scissors'
  },
  {
    id: 'srv-2',
    name: 'Barba Impart e Toalha Quente',
    price: 35,
    durationMinutes: 25,
    description: 'Modelagem completa da barba com vaporizador de ozônio, toalha quente e óleos essenciais.',
    category: 'barba',
    popular: false,
    iconName: 'Sparkles'
  },
  {
    id: 'srv-3',
    name: 'Combo Jadson Master (Corte + Barba)',
    price: 70,
    durationMinutes: 55,
    description: 'A experiência completa: Corte estilizado + barba completa com tratamento VIP.',
    category: 'combo',
    popular: true,
    iconName: 'Crown'
  },
  {
    id: 'srv-4',
    name: 'Pigmentação de Barba & Cabelo',
    price: 40,
    durationMinutes: 30,
    description: 'Preenchimento de falhas e realce dos contornos com pigmento orgânico de longa duração.',
    category: 'especial',
    popular: false,
    iconName: 'Palette'
  },
  {
    id: 'srv-5',
    name: 'Sobrancelha Navalhada',
    price: 15,
    durationMinutes: 15,
    description: 'Design e alinhamento facial na navalha para um olhar impecável.',
    category: 'especial',
    popular: false,
    iconName: 'Eye'
  },
  {
    id: 'srv-6',
    name: 'Tratamento Capilar VIP',
    price: 50,
    durationMinutes: 30,
    description: 'Hidratação profunda, lavatório relaxante e massagem capilar revigorante.',
    category: 'especial',
    popular: false,
    iconName: 'Zap'
  }
];

// Default initial barbers
export const DEFAULT_BARBERS: Barber[] = [
  {
    id: 'brb-1',
    name: 'Jadson Barber',
    role: 'Master Barber & Founder',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    rating: 5.0,
    specialties: ['Degradê Navalhado', 'Barboterapia', 'Visagismo'],
    status: 'active'
  },
  {
    id: 'brb-2',
    name: 'Marcos Silva',
    role: 'Senior Barber',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    rating: 4.9,
    specialties: ['Freestyle Hair Art', 'Barba Quadrada', 'Corte Clássico'],
    status: 'active'
  },
  {
    id: 'brb-3',
    name: 'Lucas Santos',
    role: 'Fade Specialist',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    rating: 4.8,
    specialties: ['Americano', 'Corte Infantil', 'Pigmentação'],
    status: 'active'
  }
];

const todayStr = new Date().toISOString().split('T')[0];

export const DEFAULT_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-101',
    clientId: 'cli-001',
    clientName: 'Carlos Eduardo',
    clientEmail: 'carlos.edu@gmail.com',
    clientPhone: '(11) 98765-4321',
    serviceId: 'srv-3',
    serviceName: 'Combo Jadson Master (Corte + Barba)',
    servicePrice: 70,
    serviceDuration: 55,
    barberId: 'brb-1',
    barberName: 'Jadson Barber',
    date: todayStr,
    timeSlot: '10:00',
    notes: 'Degradê médio com risco no lado esquerdo',
    status: 'confirmado',
    createdAt: new Date().toISOString()
  },
  {
    id: 'apt-102',
    clientId: 'cli-002',
    clientName: 'Roberto Mendes',
    clientEmail: 'roberto.mendes@outlook.com',
    clientPhone: '(11) 97123-8899',
    serviceId: 'srv-1',
    serviceName: 'Corte Slim Degradê',
    servicePrice: 45,
    serviceDuration: 30,
    barberId: 'brb-2',
    barberName: 'Marcos Silva',
    date: todayStr,
    timeSlot: '14:30',
    status: 'pendente',
    createdAt: new Date().toISOString()
  },
  {
    id: 'apt-103',
    clientId: 'cli-003',
    clientName: 'Felipe Santana',
    clientEmail: 'felipe.s@gmail.com',
    clientPhone: '(11) 99111-2233',
    serviceId: 'srv-2',
    serviceName: 'Barba Impart e Toalha Quente',
    servicePrice: 35,
    serviceDuration: 25,
    barberId: 'brb-1',
    barberName: 'Jadson Barber',
    date: todayStr,
    timeSlot: '16:00',
    status: 'concluido',
    createdAt: new Date().toISOString()
  }
];

export const GENERATE_TIME_SLOTS = (): string[] => {
  return [
    '08:00', '08:40', '09:20', '10:00', '10:40', '11:20',
    '13:00', '13:40', '14:20', '15:00', '15:40', '16:20',
    '17:00', '17:40', '18:20', '19:00', '19:40'
  ];
};

// Internal memory caches initialized
let cachedAppointments: Appointment[] = [];
let cachedServices: Service[] = [];
let cachedBarbers: Barber[] = [];
let cachedBlockedSlots: BlockedSlot[] = [];
let cachedConfig: ShopConfig = DEFAULT_SHOP_CONFIG;

// Seed Firestore if empty
let isSeeded = false;
export async function seedFirestoreIfEmpty() {
  if (isSeeded) return;
  isSeeded = true;
  try {
    // Seed Services
    const srvSnap = await getDocs(collection(db, 'servicos'));
    if (srvSnap.empty) {
      for (const s of DEFAULT_SERVICES) {
        await saveService(s);
      }
    }

    // Seed Barbers
    const brbSnap = await getDocs(collection(db, 'profissionais'));
    if (brbSnap.empty) {
      for (const b of DEFAULT_BARBERS) {
        await saveBarber(b);
      }
    }

    // Seed Appointments
    const aptSnap = await getDocs(collection(db, 'agendamentos'));
    if (aptSnap.empty) {
      for (const a of DEFAULT_APPOINTMENTS) {
        await setDoc(doc(db, 'agendamentos', a.id), a);
      }
    }

    // Seed Config
    const cfgSnap = await getDocs(collection(db, 'configuracoes'));
    if (cfgSnap.empty) {
      await saveShopConfig(DEFAULT_SHOP_CONFIG);
    }
  } catch (err) {
    console.warn('Seeding notice:', err);
  }
}

// Start background seed check
seedFirestoreIfEmpty();

// Realtime subscribers
export const subscribeRealTime = (callback: () => void) => {
  const unsubs: (() => void)[] = [];

  unsubs.push(subscribeAppointments((apts) => {
    cachedAppointments = apts;
    callback();
  }));

  unsubs.push(subscribeServices((srvs) => {
    cachedServices = srvs;
    callback();
  }));

  unsubs.push(subscribeBarbers((brbs) => {
    cachedBarbers = brbs;
    callback();
  }));

  unsubs.push(subscribeBlockedSlots((slots) => {
    cachedBlockedSlots = slots;
    callback();
  }));

  unsubs.push(subscribeShopConfig((cfg) => {
    cachedConfig = cfg;
    callback();
  }));

  return () => {
    unsubs.forEach(u => u());
  };
};

// Data Getters
export const getStoredAppointments = (): Appointment[] => cachedAppointments;
export const getStoredServices = (): Service[] => cachedServices.length > 0 ? cachedServices : DEFAULT_SERVICES;
export const getStoredBarbers = (): Barber[] => cachedBarbers.length > 0 ? cachedBarbers : DEFAULT_BARBERS;
export const getStoredBlockedSlots = (): BlockedSlot[] => cachedBlockedSlots;
export const getStoredShopConfig = (): ShopConfig => cachedConfig;

// Data Setters / Firestore Mutators
export const saveAppointments = async (appointments: Appointment[]) => {
  cachedAppointments = appointments;
};

export const saveServices = async (services: Service[]) => {
  cachedServices = services;
  for (const s of services) {
    await saveService(s);
  }
};

export const saveBarbers = async (barbers: Barber[]) => {
  cachedBarbers = barbers;
  for (const b of barbers) {
    await saveBarber(b);
  }
};

export const saveBlockedSlots = async (slots: BlockedSlot[]) => {
  cachedBlockedSlots = slots;
};

// Auth session local helper
const CURRENT_USER_KEY = 'jadson_barber_user_v1';
export const getCurrentUser = (): UserAccount | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};

export const setCurrentUser = (user: UserAccount | null) => {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
  } else {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    saveUserAccount(user).catch(console.error);
  }
};

export {
  createAppointment,
  updateAppointmentStatus,
  removeAppointment,
  saveService,
  removeService,
  saveBarber,
  removeBarber,
  toggleBlockedSlot
};
