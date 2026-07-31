import { Appointment, Service, Barber, UserAccount } from '../types';

export interface DashboardStats {
  totalRevenue: number;
  todayAppointmentsCount: number;
  pendingCount: number;
  completedCount: number;
  canceledCount: number;
  activeClientsCount: number;
  popularServices: { name: string; count: number }[];
}

export function calculateDashboardStats(
  appointments: Appointment[], 
  _services: Service[], 
  _barbers: Barber[], 
  users: UserAccount[]
): DashboardStats {
  const todayStr = new Date().toISOString().split('T')[0];

  const confirmedOrCompleted = appointments.filter(a => a.status === 'confirmado' || a.status === 'concluido');
  const totalRevenue = confirmedOrCompleted.reduce((sum, a) => sum + (a.servicePrice || 0), 0);

  const todayAppointmentsCount = appointments.filter(a => a.date === todayStr).length;
  const pendingCount = appointments.filter(a => a.status === 'pendente').length;
  const completedCount = appointments.filter(a => a.status === 'concluido').length;
  const canceledCount = appointments.filter(a => a.status === 'cancelado').length;

  // Service popularity map
  const serviceCountMap: Record<string, number> = {};
  appointments.forEach(a => {
    const sName = a.serviceName || 'Serviço';
    serviceCountMap[sName] = (serviceCountMap[sName] || 0) + 1;
  });

  const popularServices = Object.entries(serviceCountMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const activeClientsCount = users.filter(u => u.role === 'client').length;

  return {
    totalRevenue,
    todayAppointmentsCount,
    pendingCount,
    completedCount,
    canceledCount,
    activeClientsCount,
    popularServices
  };
}
