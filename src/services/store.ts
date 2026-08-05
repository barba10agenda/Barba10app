import { Appointment, Barber, Service, BlockedSlot, UserAccount } from '../types';
import { db } from '../firebase/firebaseConfig';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { subscribeAppointments, createAppointment, updateAppointmentStatus, updateAppointment, removeAppointment } from './agendamentos';
import { subscribeServices, saveService, removeService } from './servicos';
import { subscribeBarbers, saveBarber, removeBarber } from './profissionais';
import { subscribeBlockedSlots, toggleBlockedSlot } from './horarios';
import { subscribeShopConfig, saveShopConfig, DEFAULT_SHOP_CONFIG, ShopConfig } from './configuracoes';
import { saveUserAccount } from './usuarios';
import { checkAndPlayNewAppointmentSound } from '../utils/soundNotification';

// Default initial services (empty for live production)
export const DEFAULT_SERVICES: Service[] = [];

// Default initial barbers (empty for live production)
export const DEFAULT_BARBERS: Barber[] = [];

export const DEFAULT_APPOINTMENTS: Appointment[] = [];

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

// Seed Firestore config if empty
let isSeeded = false;
export async function seedFirestoreIfEmpty() {
  if (isSeeded) return;
  isSeeded = true;
  try {
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
    checkAndPlayNewAppointmentSound(apts, getCurrentUser()?.role);
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
export const getStoredServices = (): Service[] => cachedServices;
export const getStoredBarbers = (): Barber[] => cachedBarbers;
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
  updateAppointment,
  removeAppointment,
  saveService,
  removeService,
  saveBarber,
  removeBarber,
  toggleBlockedSlot
};
