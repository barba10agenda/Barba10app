export interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  description: string;
  category: 'corte' | 'barba' | 'combo' | 'especial';
  popular?: boolean;
  iconName?: string;
}

export interface Barber {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
  avatarUrl?: string;
  rating?: number;
  specialties?: string[];
  status?: 'active' | 'away' | 'inactive';

  // Dados adicionais do cadastro (todos opcionais)
  cpf?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  pixKey?: string;
  salary?: number | string;
  serviceCommission?: number | string;
  salesCommission?: number | string;
  lunchBreak?: string;
  lunchStart?: string;
  lunchEnd?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  blockedByAdmin?: boolean;
}

export type AppointmentStatus = 'confirmado' | 'pendente' | 'concluido' | 'cancelado';

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceId: string;
  serviceIds?: string[];
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  barberId: string;
  barberName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm
  beverage?: string;
  notes?: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'client' | 'admin';
  status?: 'active' | 'inactive';
}

export interface BlockedSlot {
  date: string;
  timeSlot: string;
  barberId?: string;
  reason?: string;
}

export interface InsumoItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  costPrice: number;
  notes?: string;
  updatedAt?: string;
}

export interface ProdutoVenda {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  costPrice: number;
  salePrice: number;
  salesCommission?: number;
  description?: string;
  imageUrl?: string;
  updatedAt?: string;
}
