import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Calendar, Clock, DollarSign, Users, Scissors, 
  Check, X, AlertCircle, Plus, Edit3, Trash2, Phone, Search, Radio, Database, Sparkles,
  Menu, LogOut, User, ChevronRight, Settings, Save, Layout, FileText, Building, LayoutDashboard, TrendingUp,
  UserCheck, MessageCircle, Mail, Package, ShoppingBag, Tag, Box, Layers, AlertTriangle, Upload, Image as ImageIcon, Volume2, VolumeX, Music
} from 'lucide-react';
import { playAppointmentNotificationSound, getSoundSettings, saveSoundSettings, SoundSettings } from '../utils/soundNotification';
import { Appointment, Service, Barber, BlockedSlot, AppointmentStatus, UserAccount, InsumoItem, ProdutoVenda } from '../types';
import { GENERATE_TIME_SLOTS } from '../services/store';
import { ShopConfig } from '../services/configuracoes';
import { subscribeAllUsers, updateUserAccount, deleteUserAccount, saveUserAccount } from '../services/usuarios';
import { 
  subscribeInsumos, saveInsumoItem, deleteInsumoItem,
  subscribeProdutosVenda, saveProdutoVenda, deleteProdutoVenda 
} from '../services/estoque';
import { EstoqueInsumosTab } from './EstoqueInsumosTab';
import { ProdutosVendaTab } from './ProdutosVendaTab';
import { compressImageFile } from '../utils/imageCompressor';

export interface DaySchedule {
  id: string;
  label: string;
  startHour: string;
  endHour: string;
  enabled: boolean;
  slots: { time: string; active: boolean; isExtra?: boolean }[];
}

const DEFAULT_WEEKLY_SCHEDULE: DaySchedule[] = [
  {
    id: 'segunda',
    label: 'Segunda-feira',
    startHour: '08:00h',
    endHour: '20:00h',
    enabled: true,
    slots: [
      { time: '08:00', active: true }, { time: '08:40', active: true }, { time: '09:20', active: true },
      { time: '10:00', active: true }, { time: '10:40', active: true }, { time: '11:20', active: true },
      { time: '12:00', active: true }, { time: '13:00', active: true }, { time: '13:40', active: true },
      { time: '14:20', active: true }, { time: '15:00', active: true }, { time: '15:40', active: true },
      { time: '16:20', active: true }, { time: '17:00', active: true }, { time: '17:40', active: true },
      { time: '18:20', active: true }, { time: '19:00', active: true }, { time: '19:40', active: true },
    ]
  },
  {
    id: 'terca',
    label: 'Terça-feira',
    startHour: '08:00h',
    endHour: '20:00h',
    enabled: true,
    slots: [
      { time: '08:00', active: true }, { time: '08:40', active: true }, { time: '09:20', active: true },
      { time: '10:00', active: true }, { time: '10:40', active: true }, { time: '11:20', active: true },
      { time: '12:00', active: true }, { time: '13:00', active: true }, { time: '13:40', active: true },
      { time: '14:20', active: true }, { time: '15:00', active: true }, { time: '15:40', active: true },
      { time: '16:20', active: true }, { time: '17:00', active: true }, { time: '17:40', active: true },
      { time: '18:20', active: true }, { time: '19:00', active: true }, { time: '19:40', active: true },
    ]
  },
  {
    id: 'quarta',
    label: 'Quarta-feira',
    startHour: '08:00h',
    endHour: '20:00h',
    enabled: true,
    slots: [
      { time: '08:00', active: true }, { time: '08:40', active: true }, { time: '09:20', active: true },
      { time: '10:00', active: true }, { time: '10:40', active: true }, { time: '11:20', active: true },
      { time: '12:00', active: true }, { time: '13:00', active: true }, { time: '13:40', active: true },
      { time: '14:20', active: true }, { time: '15:00', active: true }, { time: '15:40', active: true },
      { time: '16:20', active: true }, { time: '17:00', active: true }, { time: '17:40', active: true },
      { time: '18:20', active: true }, { time: '19:00', active: true }, { time: '19:40', active: true },
    ]
  },
  {
    id: 'quinta',
    label: 'Quinta-feira',
    startHour: '08:00h',
    endHour: '20:00h',
    enabled: true,
    slots: [
      { time: '08:00', active: true }, { time: '08:40', active: true }, { time: '09:20', active: true },
      { time: '10:00', active: true }, { time: '10:40', active: true }, { time: '11:20', active: true },
      { time: '12:00', active: true }, { time: '13:00', active: true }, { time: '13:40', active: true },
      { time: '14:20', active: true }, { time: '15:00', active: true }, { time: '15:40', active: true },
      { time: '16:20', active: true }, { time: '17:00', active: true }, { time: '17:40', active: true },
      { time: '18:20', active: true }, { time: '19:00', active: true }, { time: '19:40', active: true },
    ]
  },
  {
    id: 'sexta',
    label: 'Sexta-feira',
    startHour: '08:00h',
    endHour: '20:00h',
    enabled: true,
    slots: [
      { time: '08:00', active: true }, { time: '08:40', active: true }, { time: '09:20', active: true },
      { time: '10:00', active: true }, { time: '10:40', active: true }, { time: '11:20', active: true },
      { time: '12:00', active: true }, { time: '13:00', active: true }, { time: '13:40', active: true },
      { time: '14:20', active: true }, { time: '15:00', active: true }, { time: '15:40', active: true },
      { time: '16:20', active: true }, { time: '17:00', active: true }, { time: '17:40', active: true },
      { time: '18:20', active: true }, { time: '19:00', active: true }, { time: '19:40', active: true },
    ]
  },
  {
    id: 'sabado',
    label: 'Sábado',
    startHour: '08:00h',
    endHour: '20:00h',
    enabled: true,
    slots: [
      { time: '08:00', active: true }, { time: '08:40', active: true }, { time: '09:20', active: true },
      { time: '10:00', active: true }, { time: '10:40', active: true }, { time: '11:20', active: true },
      { time: '12:00', active: true }, { time: '13:00', active: true }, { time: '13:40', active: true },
      { time: '14:20', active: true }, { time: '15:00', active: true }, { time: '15:40', active: true },
      { time: '16:20', active: true }, { time: '17:00', active: true }, { time: '17:40', active: true },
      { time: '18:20', active: true }, { time: '19:00', active: true }, { time: '19:40', active: true },
    ]
  },
  {
    id: 'domingo',
    label: 'Domingo',
    startHour: '08:00h',
    endHour: '12:00h',
    enabled: true,
    slots: [
      { time: '08:00', active: true }, { time: '08:40', active: true }, { time: '09:20', active: true },
      { time: '10:00', active: true }, { time: '10:40', active: true }, { time: '11:20', active: true },
    ]
  }
];

interface AdminPanelProps {
  appointments: Appointment[];
  services: Service[];
  barbers: Barber[];
  blockedSlots: BlockedSlot[];
  onUpdateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  onDeleteAppointment: (id: string) => void;
  onToggleBlockSlot: (date: string, timeSlot: string, barberId?: string) => void;
  onSaveService: (service: Service) => void;
  onDeleteService: (id: string) => void;
  onSaveBarber: (barber: Barber) => void;
  onDeleteBarber?: (id: string) => void;
  realtimeActive: boolean;
  currentUser?: UserAccount | null;
  onLogout?: () => void;
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  shopConfig?: ShopConfig;
  onSaveShopConfig?: (config: ShopConfig) => Promise<void> | void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  appointments,
  services,
  barbers,
  blockedSlots,
  onUpdateAppointmentStatus,
  onDeleteAppointment,
  onToggleBlockSlot,
  onSaveService,
  onDeleteService,
  onSaveBarber,
  onDeleteBarber,
  realtimeActive,
  currentUser,
  onLogout,
  isSidebarOpen,
  setIsSidebarOpen,
  shopConfig,
  onSaveShopConfig,
}) => {
  const [internalSidebarOpen, setInternalSidebarOpen] = useState(false);
  const sidebarOpen = isSidebarOpen !== undefined ? isSidebarOpen : internalSidebarOpen;
  const setSidebarOpen = setIsSidebarOpen || setInternalSidebarOpen;

  const [activeTab, setActiveTab] = useState<'dashboard' | 'agendamentos' | 'clientes' | 'horarios' | 'servicos' | 'barbeiros' | 'insumos' | 'produtos' | 'firebase' | 'configuracoes'>('agendamentos');
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [editingClient, setEditingClient] = useState<{
    id: string;
    name: string;
    email: string;
    phone: string;
    status: 'active' | 'inactive';
  } | null>(null);

  // Registered Users & Clients State
  const [registeredUsers, setRegisteredUsers] = useState<UserAccount[]>([]);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [deletedClientKeys, setDeletedClientKeys] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jadson_deleted_client_keys');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return [];
  });
  const [selectedClientForModal, setSelectedClientForModal] = useState<{
    id: string;
    name: string;
    email: string;
    phone: string;
    totalAppointments: number;
    totalSpent: number;
    lastVisit: string;
    appointments: Appointment[];
  } | null>(null);

  // Estoque Insumos State
  const [insumosList, setInsumosList] = useState<InsumoItem[]>([]);
  const [insumoSearch, setInsumoSearch] = useState('');
  const [insumoCategoryFilter, setInsumoCategoryFilter] = useState('todos');
  const [editingInsumo, setEditingInsumo] = useState<Partial<InsumoItem> | null>(null);
  const [isInsumoModalOpen, setIsInsumoModalOpen] = useState(false);

  // Produtos de Venda State
  const [produtosVendaList, setProdutosVendaList] = useState<ProdutoVenda[]>([]);
  const [produtoSearch, setProdutoSearch] = useState('');
  const [produtoCategoryFilter, setProdutoCategoryFilter] = useState('todos');
  const [editingProduto, setEditingProduto] = useState<Partial<ProdutoVenda> | null>(null);
  const [isProdutoModalOpen, setIsProdutoModalOpen] = useState(false);

  // Sound Effect Notification Settings
  const [soundSettings, setSoundSettings] = useState<SoundSettings>(() => getSoundSettings());
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);

  const handleUpdateSoundSettings = (newSettings: SoundSettings) => {
    saveSoundSettings(newSettings);
    setSoundSettings(newSettings);
  };

  useEffect(() => {
    const unsubscribe = subscribeAllUsers((users) => {
      setRegisteredUsers(users);
    });
    const unsubInsumos = subscribeInsumos((items) => setInsumosList(items));
    const unsubProdutos = subscribeProdutosVenda((items) => setProdutosVendaList(items));
    return () => {
      unsubscribe();
      unsubInsumos();
      unsubProdutos();
    };
  }, []);

  // Config Form State
  const [configFormData, setConfigFormData] = useState<ShopConfig>(() => ({
    shopName: shopConfig?.shopName || 'JADSON BARBER',
    shopTagline: shopConfig?.shopTagline || 'ATENDIMENTO SLIM VIP',
    phone: shopConfig?.phone || '(11) 99999-2525',
    address: shopConfig?.address || 'Av. Principal, 1000 - Centro',
    instagram: shopConfig?.instagram || '@jadsonbarber',
    openingHours: shopConfig?.openingHours || 'Terça a Sábado: 08:00 - 20:00',
    heroBadge: shopConfig?.heroBadge || 'PREMIUM EXPERIENCE',
    heroTitleLine1: shopConfig?.heroTitleLine1 || 'O ESTILO QUE',
    heroTitleLine2: shopConfig?.heroTitleLine2 || 'VOCÊ MERECE.',
    heroDescription: shopConfig?.heroDescription || 'Agende seu horário com o mestre Jadson. Cortes clássicos, degradês modernos, visagismo e barba com toalha quente em ambiente exclusivo.',
    ctaButtonText: shopConfig?.ctaButtonText || 'AGENDAR AGORA',
    ctaSubtext: shopConfig?.ctaSubtext || 'RESERVA SIMPLES & RÁPIDA',
    highlightsPill1: shopConfig?.highlightsPill1 || 'Atendimento Exclusivo',
    highlightsPill2: shopConfig?.highlightsPill2 || 'Visagismo Slim Custom',
    highlightsPill3: shopConfig?.highlightsPill3 || 'Toalha Quente & Vapor',
    highlightsPill4: shopConfig?.highlightsPill4 || 'Pontualidade VIP',
    bannerTitle: shopConfig?.bannerTitle || 'PRONTO PARA RENOVAR SEU VISUAL?',
    bannerDescription: shopConfig?.bannerDescription || 'Inicie nosso Agendamento Slim em 4 etapas simples: escolha data e horário, barbeiro, serviços e confirme seu resumo.',
    bannerButtonText: shopConfig?.bannerButtonText || 'INICIAR AGENDAMENTO AGORA'
  }));

  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSuccessMsg, setConfigSuccessMsg] = useState('');

  useEffect(() => {
    if (shopConfig) {
      setConfigFormData(prev => ({
        ...prev,
        ...shopConfig
      }));
    }
  }, [shopConfig]);

  const handleSaveConfigSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!onSaveShopConfig) return;
    setIsSavingConfig(true);
    setConfigSuccessMsg('');
    try {
      await onSaveShopConfig(configFormData);
      setConfigSuccessMsg('Configurações da Página Inicial salvas com sucesso!');
      setTimeout(() => setConfigSuccessMsg(''), 4000);
    } catch {
      alert('Erro ao salvar configurações.');
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Filters for Appointments Tab
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Schedule Management State
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedScheduleDate, setSelectedScheduleDate] = useState<string>(todayStr);

  // Weekly Schedule by Day of the Week State
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jadson_weekly_schedules_v2');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return DEFAULT_WEEKLY_SCHEDULE;
  });

  const [selectedDayId, setSelectedDayId] = useState<string>('segunda');
  const [extraSlotInput, setExtraSlotInput] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jadson_weekly_schedules_v2', JSON.stringify(weeklySchedule));
    }
  }, [weeklySchedule]);

  const currentSelectedDay = weeklySchedule.find(d => d.id === selectedDayId) || weeklySchedule[0];

  const handleToggleDayEnabled = (dayId: string) => {
    setWeeklySchedule(prev => prev.map(day => {
      if (day.id === dayId) {
        return { ...day, enabled: !day.enabled };
      }
      return day;
    }));
  };

  const handleToggleSlotActive = (dayId: string, timeSlot: string) => {
    setWeeklySchedule(prev => prev.map(day => {
      if (day.id === dayId) {
        const updatedSlots = day.slots.map(s => {
          if (s.time === timeSlot) {
            return { ...s, active: !s.active };
          }
          return s;
        });
        return { ...day, slots: updatedSlots };
      }
      return day;
    }));
  };

  const handleAddExtraSlot = (dayId: string) => {
    if (!extraSlotInput.trim()) return;
    let formatted = extraSlotInput.trim();
    if (/^\d{1,2}:\d{2}$/.test(formatted)) {
      const parts = formatted.split(':');
      const hh = parts[0].padStart(2, '0');
      const mm = parts[1];
      formatted = `${hh}:${mm}`;
    } else if (/^\d{4}$/.test(formatted)) {
      formatted = `${formatted.slice(0, 2)}:${formatted.slice(2)}`;
    }

    setWeeklySchedule(prev => prev.map(day => {
      if (day.id === dayId) {
        if (day.slots.some(s => s.time === formatted)) {
          alert('Este horário já existe na lista.');
          return day;
        }
        const newSlots = [...day.slots, { time: formatted, active: true, isExtra: true }];
        newSlots.sort((a, b) => a.time.localeCompare(b.time));
        return { ...day, slots: newSlots };
      }
      return day;
    }));

    setExtraSlotInput('');
  };

  const handleRemoveExtraSlot = (dayId: string, timeSlot: string) => {
    if (confirm(`⚠️ ATENÇÃO: Tem certeza que deseja excluir o horário "${timeSlot}" do dia ${currentSelectedDay.label}?`)) {
      setWeeklySchedule(prev => prev.map(day => {
        if (day.id === dayId) {
          return {
            ...day,
            slots: day.slots.filter(s => s.time !== timeSlot)
          };
        }
        return day;
      }));
    }
  };

  // New Service Modal / Form state
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);

  // Calculate Metrics
  const totalRevenue = appointments
    .filter((a) => a.status === 'concluido' || a.status === 'confirmado')
    .reduce((sum, a) => sum + a.servicePrice, 0);

  const todayAppointments = appointments.filter((a) => a.date === todayStr);
  const pendingCount = appointments.filter((a) => a.status === 'pendente').length;
  const confirmedCount = appointments.filter((a) => a.status === 'confirmado').length;
  const completedCount = appointments.filter((a) => a.status === 'concluido').length;

  // Filtered Appointments list
  const filteredAppointments = appointments.filter((a) => {
    const matchesSearch =
      a.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.clientPhone.includes(searchQuery) ||
      a.serviceName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'todos' || a.status === statusFilter;
    const matchesDate = !dateFilter || a.date === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Aggregated Registered Clients Logic
  const clientMap = new Map<string, {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: 'active' | 'inactive';
    totalAppointments: number;
    totalSpent: number;
    lastVisit: string;
    appointments: Appointment[];
  }>();

  // 1. Add registered users from user accounts
  registeredUsers.forEach(user => {
    if (user.role === 'client') {
      const key = (user.phone || user.email || user.name || user.id).trim().toLowerCase();
      if (key && !deletedClientKeys.includes(user.id) && !deletedClientKeys.includes(key)) {
        clientMap.set(key, {
          id: user.id,
          name: user.name || 'Cliente Cadastrado',
          email: user.email || '',
          phone: user.phone || '',
          status: user.status || 'active',
          totalAppointments: 0,
          totalSpent: 0,
          lastVisit: 'Sem agendamentos',
          appointments: []
        });
      }
    }
  });

  // 2. Process all appointments to enrich/add client records
  appointments.forEach(apt => {
    const key = (apt.clientPhone || apt.clientEmail || apt.clientName || apt.clientId).trim().toLowerCase();
    if (!key) return;
    if (
      deletedClientKeys.includes(apt.clientId) ||
      deletedClientKeys.includes(key) ||
      (apt.clientPhone && deletedClientKeys.includes(apt.clientPhone.trim().toLowerCase())) ||
      (apt.clientEmail && deletedClientKeys.includes(apt.clientEmail.trim().toLowerCase())) ||
      (apt.clientName && deletedClientKeys.includes(apt.clientName.trim().toLowerCase()))
    ) {
      return;
    }

    const existing = clientMap.get(key) || {
      id: apt.clientId || 'cli-' + Math.random().toString(36).substring(2, 8),
      name: apt.clientName || 'Cliente',
      email: apt.clientEmail || '',
      phone: apt.clientPhone || '',
      status: 'active',
      totalAppointments: 0,
      totalSpent: 0,
      lastVisit: 'Sem agendamentos',
      appointments: []
    };

    existing.totalAppointments += 1;
    existing.appointments.push(apt);

    if (apt.status === 'concluido' || apt.status === 'confirmado') {
      existing.totalSpent += apt.servicePrice || 0;
    }

    if (existing.lastVisit === 'Sem agendamentos' || apt.date > existing.lastVisit) {
      existing.lastVisit = apt.date;
    }

    if (!existing.name && apt.clientName) existing.name = apt.clientName;
    if (!existing.phone && apt.clientPhone) existing.phone = apt.clientPhone;
    if (!existing.email && apt.clientEmail) existing.email = apt.clientEmail;

    clientMap.set(key, existing);
  });

  const clientList = Array.from(clientMap.values()).sort((a, b) => b.totalAppointments - a.totalAppointments);

  const filteredClients = clientList.filter(c =>
    c.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    c.phone.includes(clientSearchTerm) ||
    c.email.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

  const allTimeSlots = GENERATE_TIME_SLOTS();

  return (
    <div className="space-y-6 pb-16">
      <div className="flex border-b border-zinc-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-extrabold transition-all shrink-0 ${
            activeTab === 'dashboard'
              ? 'border-amber-400 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </button>

        <button
          onClick={() => setActiveTab('agendamentos')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-extrabold transition-all shrink-0 ${
            activeTab === 'agendamentos'
              ? 'border-amber-400 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Calendar className="h-4 w-4" />
          Agendamentos ({appointments.length})
        </button>

        <button
          onClick={() => setActiveTab('clientes')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-extrabold transition-all shrink-0 ${
            activeTab === 'clientes'
              ? 'border-amber-400 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <UserCheck className="h-4 w-4" />
          Clientes Cadastrados ({clientList.length})
        </button>

        <button
          onClick={() => setActiveTab('horarios')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-extrabold transition-all shrink-0 ${
            activeTab === 'horarios'
              ? 'border-amber-400 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Clock className="h-4 w-4" />
          Horários
        </button>

        <button
          onClick={() => setActiveTab('servicos')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-extrabold transition-all shrink-0 ${
            activeTab === 'servicos'
              ? 'border-amber-400 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Scissors className="h-4 w-4" />
          Cortes & Preços ({services.length})
        </button>

        <button
          onClick={() => setActiveTab('barbeiros')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-extrabold transition-all shrink-0 ${
            activeTab === 'barbeiros'
              ? 'border-amber-400 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" />
          Barbeiros ({barbers.length})
        </button>

        <button
          onClick={() => setActiveTab('insumos')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-extrabold transition-all shrink-0 ${
            activeTab === 'insumos'
              ? 'border-amber-400 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Package className="h-4 w-4 text-amber-400" />
          Estoque Insumos ({insumosList.length})
        </button>

        <button
          onClick={() => setActiveTab('produtos')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-extrabold transition-all shrink-0 ${
            activeTab === 'produtos'
              ? 'border-amber-400 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="h-4 w-4 text-amber-400" />
          Produtos de Venda ({produtosVendaList.length})
        </button>

        <button
          onClick={() => setActiveTab('configuracoes')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-extrabold transition-all shrink-0 ${
            activeTab === 'configuracoes'
              ? 'border-amber-400 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Settings className="h-4 w-4 text-amber-400" />
          Configurações (Página Inicial)
        </button>

        <div className="ml-auto flex items-center gap-2 py-1.5 px-2">
          <button
            type="button"
            onClick={() => setIsSoundModalOpen(true)}
            title="Configurar efeito sonoro e importar áudio do dispositivo"
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-all shrink-0 cursor-pointer"
          >
            {soundSettings.enabled ? (
              <Volume2 className="h-4 w-4 text-amber-400" />
            ) : (
              <VolumeX className="h-4 w-4 text-red-400" />
            )}
            <span>Configurar Som</span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded font-black uppercase ${
              soundSettings.enabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {soundSettings.enabled ? (soundSettings.soundType === 'custom' ? 'Dispositivo' : 'Padrão') : 'Desativado'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              playAppointmentNotificationSound(true);
            }}
            title="Clique para testar o sinal sonoro agora"
            className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-700 transition-all shrink-0 cursor-pointer"
          >
            <Volume2 className="h-3.5 w-3.5 text-amber-400" />
            <span>Testar Som</span>
          </button>
        </div>
      </div>

      {/* TAB 0: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* 4 Cards Principais do Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Agendamentos Hoje</span>
                <Calendar className="h-4 w-4 text-amber-400" />
              </div>
              <p className="font-syne text-3xl font-extrabold text-white">{todayAppointments.length}</p>
              <span className="text-[10px] text-zinc-400 block font-medium">Total de clientes para hoje</span>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Receita Estimada</span>
                <DollarSign className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="font-syne text-3xl font-extrabold text-emerald-400">R$ {totalRevenue.toFixed(2)}</p>
              <span className="text-[10px] text-zinc-400 block font-medium">Confirmados e concluídos</span>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Status Ativos</span>
                <Clock className="h-4 w-4 text-amber-400" />
              </div>
              <div className="flex items-center gap-2 text-xs font-extrabold my-1">
                <span className="text-amber-400">{confirmedCount} Confirmados</span>
                <span className="text-zinc-600">•</span>
                <span className="text-emerald-400">{completedCount} Concluídos</span>
              </div>
              <span className="text-[10px] text-zinc-400 block font-medium">Fila de atendimento</span>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Barbeiros Ativos</span>
                <Users className="h-4 w-4 text-amber-400" />
              </div>
              <p className="font-syne text-3xl font-extrabold text-white">{barbers.length}</p>
              <span className="text-[10px] text-zinc-400 block font-medium">Equipe de atendimento</span>
            </div>
          </div>

          {/* Section: Fila do Dia & Resumo dos Barbeiros */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Agendamentos de Hoje */}
            <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-400" /> Clientes Agendados para Hoje ({todayAppointments.length})
                  </h3>
                  <p className="text-[11px] text-zinc-400">Fila em tempo real da recepção</p>
                </div>
                <button
                  onClick={() => setActiveTab('agendamentos')}
                  className="text-xs font-extrabold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Ver Todos
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {todayAppointments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center space-y-2 bg-zinc-950/40">
                  <Calendar className="h-8 w-8 text-zinc-600 mx-auto" />
                  <p className="text-xs font-bold text-zinc-400">Nenhum agendamento para hoje ainda</p>
                  <p className="text-[10px] text-zinc-500">Novas reservas do aplicativo aparecerão aqui em tempo real.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-3.5 transition-all hover:border-zinc-700"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 font-extrabold text-xs">
                          {apt.timeSlot}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white">{apt.clientName}</h4>
                          <p className="text-[11px] text-amber-400 font-bold">{apt.serviceName} • R$ {apt.servicePrice.toFixed(2)}</p>
                          <p className="text-[10px] text-zinc-500">Barbeiro: {apt.barberName} • Tel: {apt.clientPhone}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 justify-end">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider ${
                          apt.status === 'confirmado' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          apt.status === 'concluido' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          apt.status === 'cancelado' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          'bg-zinc-800 text-zinc-300'
                        }`}>
                          {apt.status}
                        </span>

                        {apt.status === 'pendente' && (
                          <button
                            onClick={() => onUpdateAppointmentStatus(apt.id, 'confirmado')}
                            className="p-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-[10px] font-bold cursor-pointer"
                            title="Confirmar Agendamento"
                          >
                            Confirmar
                          </button>
                        )}

                        {apt.status === 'confirmado' && (
                          <button
                            onClick={() => onUpdateAppointmentStatus(apt.id, 'concluido')}
                            className="p-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-bold cursor-pointer"
                            title="Concluir Atendimento"
                          >
                            Concluir
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Desempenho dos Barbeiros & Atalhos */}
            <div className="space-y-6">
              
              {/* Barbeiros da Equipe */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Users className="h-4 w-4 text-amber-400" /> Equipe de Barbeiros ({barbers.length})
                  </h3>
                  <button
                    onClick={() => setActiveTab('barbeiros')}
                    className="text-xs font-extrabold text-amber-400 hover:underline cursor-pointer"
                  >
                    Gerenciar
                  </button>
                </div>

                <div className="space-y-2.5">
                  {barbers.map((barber) => {
                    const barberTodayApts = todayAppointments.filter((a) => a.barberId === barber.id || a.barberName === barber.name);
                    const barberRevenue = barberTodayApts
                      .filter((a) => a.status === 'concluido' || a.status === 'confirmado')
                      .reduce((sum, a) => sum + a.servicePrice, 0);

                    return (
                      <div key={barber.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-800/60 bg-zinc-950/60">
                        <div className="flex items-center gap-3">
                          <img
                            src={barber.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                            alt={barber.name}
                            className="h-9 w-9 rounded-full object-cover border border-amber-500/30 shrink-0"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-white">{barber.name}</h4>
                            <p className="text-[10px] text-zinc-500">{barber.specialties?.join(', ') || 'Corte & Barba'}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-extrabold text-amber-400 block">{barberTodayApts.length} atend. hoje</span>
                          <span className="text-[10px] font-bold text-emerald-400 block">R$ {barberRevenue.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Atalhos de Ação Rápida */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3">
                <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Ações Rápidas
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveTab('agendamentos')}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-800/80 hover:border-amber-500/40 text-center transition-all cursor-pointer group"
                  >
                    <Calendar className="h-5 w-5 text-amber-400 group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-[11px] font-bold text-white">Ver Agendamentos</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('horarios')}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-800/80 hover:border-amber-500/40 text-center transition-all cursor-pointer group"
                  >
                    <Clock className="h-5 w-5 text-amber-400 group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-[11px] font-bold text-white">Horários</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('servicos')}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-800/80 hover:border-amber-500/40 text-center transition-all cursor-pointer group"
                  >
                    <Scissors className="h-5 w-5 text-amber-400 group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-[11px] font-bold text-white">Preços & Serviços</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('configuracoes')}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-800/80 hover:border-amber-500/40 text-center transition-all cursor-pointer group"
                  >
                    <Settings className="h-5 w-5 text-amber-400 group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-[11px] font-bold text-white">Editar Capa / Textos</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* TAB 1: AGENDAMENTOS EM TEMPO REAL */}
      {activeTab === 'agendamentos' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar por cliente, telefone ou corte..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="todos">Todos os Status</option>
                <option value="confirmado">Confirmados</option>
                <option value="pendente">Pendentes</option>
                <option value="concluido">Concluídos</option>
                <option value="cancelado">Cancelados</option>
              </select>

              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />

              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  className="text-xs text-amber-400 underline font-bold"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Appointments Table / Cards */}
          {filteredAppointments.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-12 text-center text-zinc-400 text-xs">
              Nenhum agendamento encontrado com os filtros selecionados.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-zinc-800/90 bg-zinc-900/80 p-5 transition-all hover:border-amber-500/40"
                >
                  {/* Client Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm text-white font-syne">{apt.clientName}</strong>
                      {apt.clientEmail && (
                        <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                          {apt.clientEmail}
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          apt.status === 'confirmado'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : apt.status === 'pendente'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : apt.status === 'concluido'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                      <span>Corte: <strong className="text-amber-400">{apt.serviceName}</strong></span>
                      <span>Barbeiro: <strong className="text-white">{apt.barberName}</strong></span>
                      <span>Data: <strong className="text-white">{apt.date} às {apt.timeSlot}</strong></span>
                    </div>

                    {apt.clientPhone && (
                      <div className="pt-1 flex items-center gap-2 text-xs text-zinc-400">
                        <Phone className="h-3.5 w-3.5 text-emerald-400" />
                        <span>{apt.clientPhone}</span>
                        <a
                          href={`https://wa.me/55${apt.clientPhone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(apt.clientName)},%20confirmamos%20seu%20agendamento%20na%20Barbearia%20Jadson%20Barber!`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500 hover:text-black"
                        >
                          Chamar no WhatsApp
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions & Price */}
                  <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 border-zinc-800 pt-3 md:pt-0">
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-500 block uppercase font-bold">Valor</span>
                      <span className="font-syne text-lg font-bold text-gold-gradient">
                        R$ {apt.servicePrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {apt.status !== 'concluido' && (
                        <button
                          onClick={() => onUpdateAppointmentStatus(apt.id, 'concluido')}
                          title="Marcar como Concluído"
                          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-zinc-950"
                        >
                          Concluir
                        </button>
                      )}

                      {apt.status === 'pendente' && (
                        <button
                          onClick={() => onUpdateAppointmentStatus(apt.id, 'confirmado')}
                          title="Confirmar Agendamento"
                          className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500 hover:text-zinc-950"
                        >
                          Confirmar
                        </button>
                      )}

                      {apt.status !== 'cancelado' && (
                        <button
                          onClick={() => onUpdateAppointmentStatus(apt.id, 'cancelado')}
                          title="Cancelar Agendamento"
                          className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white"
                        >
                          Cancelar
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (confirm('Deseja excluir permanentemente este registro?')) {
                            onDeleteAppointment(apt.id);
                          }
                        }}
                        title="Excluir Registro"
                        className="rounded-xl border border-zinc-800 bg-zinc-950 p-2 text-zinc-500 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: CLIENTES CADASTRADOS */}
      {activeTab === 'clientes' && (
        <div className="space-y-6">
          {/* Header & Stats Cards */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h3 className="font-syne text-xl font-bold text-white flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-amber-400" />
                Clientes Cadastrados ({clientList.length})
              </h3>
              <p className="text-xs text-zinc-400">
                Lista completa de clientes cadastrados no sistema, telefones de contato e histórico de cortes.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                value={clientSearchTerm}
                onChange={(e) => setClientSearchTerm(e.target.value)}
                placeholder="Buscar por nome, telefone ou email..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none"
              />
              {clientSearchTerm && (
                <button
                  onClick={() => setClientSearchTerm('')}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Metrics summary for clients */}
          <div className="grid grid-cols-1 gap-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Total de Clientes</span>
              <p className="font-syne text-2xl font-extrabold text-white">{clientList.length}</p>
              <span className="text-[10px] text-amber-400 block font-medium">Base ativa no sistema</span>
            </div>
          </div>

          {/* Client List Grid */}
          {filteredClients.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center space-y-2">
              <Users className="h-8 w-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-bold text-zinc-300">Nenhum cliente encontrado</p>
              <p className="text-xs text-zinc-500">Tente buscar por outro nome, telefone ou limpe a pesquisa.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client) => {
                const cleanPhone = client.phone ? client.phone.replace(/\D/g, '') : '';
                const waLink = cleanPhone ? `https://wa.me/55${cleanPhone}?text=Olá%20${encodeURIComponent(client.name)},%20fala%20com%20a%20Barbearia%20Jadson%20Barber!` : null;

                return (
                  <div
                    key={client.id}
                    className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-4 hover:border-amber-500/40 transition-all"
                  >
                    <div className="space-y-3">
                      {/* Avatar & Name & Status */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-syne font-extrabold text-lg shrink-0">
                            {client.name ? client.name.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-syne text-base font-extrabold text-white truncate">{client.name}</h4>
                            <span className="text-[10px] bg-zinc-800 text-amber-400 px-2 py-0.5 rounded font-bold inline-block">
                              {client.totalAppointments > 3 ? 'VIP / Recorrente' : 'Cliente Cadastrado'}
                            </span>
                          </div>
                        </div>

                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border shrink-0 ${
                          client.status === 'inactive'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}>
                          {client.status === 'inactive' ? 'Inativo' : 'Ativo'}
                        </span>
                      </div>

                      {/* Contact Info Card */}
                      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-3 text-xs space-y-1.5 text-zinc-300">
                        {client.phone ? (
                          <p className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                            <strong className="text-zinc-400">Tel/WhatsApp:</strong>
                            <span className="font-mono text-white">{client.phone}</span>
                          </p>
                        ) : (
                          <p className="flex items-center gap-2 text-zinc-500">
                            <Phone className="h-3.5 w-3.5 shrink-0" /> Telefone não informado
                          </p>
                        )}

                        {client.email ? (
                          <p className="flex items-center gap-2 truncate">
                            <Mail className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                            <strong className="text-zinc-400">Email:</strong>
                            <span className="truncate text-zinc-300">{client.email}</span>
                          </p>
                        ) : (
                          <p className="flex items-center gap-2 text-zinc-500">
                            <Mail className="h-3.5 w-3.5 shrink-0" /> Email não informado
                          </p>
                        )}

                        <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-zinc-500 block">Agendamentos:</span>
                            <strong className="text-white font-bold">{client.totalAppointments} visitas</strong>
                          </div>
                          <div>
                            <span className="text-zinc-500 block">Total Gasto:</span>
                            <strong className="text-emerald-400 font-bold">R$ {client.totalSpent.toFixed(2)}</strong>
                          </div>
                          <div className="col-span-2">
                            <span className="text-zinc-500 block">Última Visita:</span>
                            <strong className="text-amber-400 font-bold">{client.lastVisit}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons: Ativar/Desativar, Editar, Excluir */}
                    <div className="space-y-2 border-t border-zinc-800/80 pt-3">
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={async () => {
                            const newStatus = client.status === 'inactive' ? 'active' : 'inactive';
                            setRegisteredUsers(prev => prev.map(u => u.id === client.id ? { ...u, status: newStatus } : u));
                            try {
                              await updateUserAccount(client.id, { status: newStatus });
                            } catch (e) {
                              console.error('Erro ao atualizar status', e);
                            }
                          }}
                          className={`py-1.5 px-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer text-center ${
                            client.status === 'inactive'
                              ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-black border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30'
                          }`}
                        >
                          {client.status === 'inactive' ? 'Ativar' : 'Desativar'}
                        </button>

                        <button
                          onClick={() => setEditingClient({
                            id: client.id,
                            name: client.name,
                            email: client.email,
                            phone: client.phone,
                            status: client.status || 'active'
                          })}
                          className="flex items-center justify-center gap-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 py-1.5 px-1 text-[11px] font-bold text-white transition-all cursor-pointer border border-zinc-700/60"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-amber-400" />
                          <span>Editar</span>
                        </button>

                        <button
                          onClick={async () => {
                            if (confirm(`⚠️ ATENÇÃO: Tem certeza que deseja excluir permanentemente o cliente "${client.name}"?\n\nEsta ação não poderá ser desfeita.`)) {
                              const keysToRemove = [
                                client.id,
                                (client.phone || '').trim().toLowerCase(),
                                (client.email || '').trim().toLowerCase(),
                                (client.name || '').trim().toLowerCase(),
                              ].filter(Boolean);

                              const updatedDeleted = Array.from(new Set([...deletedClientKeys, ...keysToRemove]));
                              setDeletedClientKeys(updatedDeleted);
                              if (typeof window !== 'undefined') {
                                localStorage.setItem('jadson_deleted_client_keys', JSON.stringify(updatedDeleted));
                              }

                              setRegisteredUsers(prev => prev.filter(u => u.id !== client.id));

                              if (client.appointments && client.appointments.length > 0) {
                                client.appointments.forEach(apt => {
                                  if (apt.id) onDeleteAppointment(apt.id);
                                });
                              }

                              try {
                                await deleteUserAccount(client.id);
                              } catch (e) {
                                console.error('Erro ao excluir cliente', e);
                              }
                            }
                          }}
                          className="flex items-center justify-center gap-1 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500 hover:text-white py-1.5 px-1 text-[11px] font-bold text-red-400 transition-all cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Excluir</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        {waLink ? (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500 hover:text-black py-1.5 text-xs font-bold text-emerald-300 transition-all cursor-pointer"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        ) : (
                          <div className="flex-1 text-center text-[11px] text-zinc-500 py-1.5">Sem WhatsApp</div>
                        )}

                        <button
                          onClick={() => setSelectedClientForModal(client)}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 py-1.5 text-xs font-bold text-white transition-all cursor-pointer"
                        >
                          <Calendar className="h-3.5 w-3.5 text-amber-400" />
                          <span>Histórico</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Modal do Histórico do Cliente */}
          {selectedClientForModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
              <div className="w-full max-w-xl rounded-3xl border border-amber-500/30 bg-zinc-950 p-6 space-y-6 shadow-2xl my-8">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-syne font-bold text-base">
                      {selectedClientForModal.name ? selectedClientForModal.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                      <h3 className="font-syne text-base font-bold text-white">{selectedClientForModal.name}</h3>
                      <p className="text-xs text-zinc-400">{selectedClientForModal.phone || selectedClientForModal.email || 'Histórico do Cliente'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedClientForModal(null)}
                    className="p-1.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                    Histórico de Agendamentos ({selectedClientForModal.appointments.length})
                  </h4>

                  {selectedClientForModal.appointments.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic py-4 text-center">Nenhum agendamento registrado no histórico deste cliente.</p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {selectedClientForModal.appointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 text-xs flex items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <p className="font-bold text-white">{apt.serviceName}</p>
                            <p className="text-[11px] text-zinc-400 flex items-center gap-2">
                              <span>📅 {apt.date} às {apt.timeSlot}</span>
                              <span>•</span>
                              <span>✂️ {apt.barberName}</span>
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-syne font-bold text-amber-400 block">R$ {apt.servicePrice.toFixed(2)}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold capitalize ${
                              apt.status === 'concluido'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : apt.status === 'confirmado'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}>
                              {apt.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-800">
                  <button
                    onClick={() => setSelectedClientForModal(null)}
                    className="rounded-xl bg-zinc-800 px-5 py-2 text-xs font-bold text-white hover:bg-zinc-700 cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal do Editar Cliente */}
          {editingClient && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
              <div className="w-full max-w-md rounded-3xl border border-amber-500/30 bg-zinc-950 p-6 space-y-5 shadow-2xl my-8">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h3 className="font-syne text-base font-bold text-white flex items-center gap-2">
                    <Edit3 className="h-4 w-4 text-amber-400" />
                    Editar Cadastro do Cliente
                  </h3>
                  <button
                    onClick={() => setEditingClient(null)}
                    className="p-1.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1 font-bold">Nome do Cliente</label>
                    <input
                      type="text"
                      value={editingClient.name}
                      onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                      placeholder="Nome completo"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1 font-bold font-mono">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      value={editingClient.phone}
                      onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none font-mono"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1 font-bold">Email</label>
                    <input
                      type="email"
                      value={editingClient.email}
                      onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                      placeholder="cliente@email.com"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1 font-bold">Status do Cadastro</label>
                    <select
                      value={editingClient.status}
                      onChange={(e) => setEditingClient({ ...editingClient, status: e.target.value as 'active' | 'inactive' })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="active">Ativo (Permitir agendamentos)</option>
                      <option value="inactive">Inativo (Bloquear / Desativado)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                  <button
                    onClick={() => setEditingClient(null)}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-800 cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={async () => {
                      if (!editingClient.name.trim()) return;
                      const updated = {
                        name: editingClient.name,
                        phone: editingClient.phone,
                        email: editingClient.email,
                        status: editingClient.status,
                      };

                      setRegisteredUsers(prev => {
                        const exists = prev.some(u => u.id === editingClient.id);
                        if (exists) {
                          return prev.map(u => u.id === editingClient.id ? { ...u, ...updated } : u);
                        } else {
                          return [...prev, { id: editingClient.id, role: 'client', ...updated }];
                        }
                      });

                      try {
                        await updateUserAccount(editingClient.id, updated);
                      } catch (e) {
                        console.error('Erro ao salvar cliente em firestore', e);
                      }

                      setEditingClient(null);
                    }}
                    className="rounded-xl bg-gold-gradient px-5 py-2 text-xs font-extrabold text-zinc-950 hover:scale-105 cursor-pointer shadow-md shadow-amber-500/20"
                  >
                    Salvar Cliente
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GESTÃO DE HORÁRIOS */}
      {activeTab === 'horarios' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
              <div>
                <h3 className="font-syne text-xl font-extrabold text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-400" />
                  Gerenciador de Horários por Dia da Semana
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Defina os horários de funcionamento para cada dia. Ative/desative horários individuais, desative o dia completo ou inclua horários extras.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-2 rounded-2xl text-xs text-amber-300 font-bold">
                <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Padrão: Seg-Sáb 8h às 20h | Dom 8h às 12h</span>
              </div>
            </div>

            {/* Days Tabs selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-5">
              {weeklySchedule.map((day) => {
                const isSelected = day.id === selectedDayId;
                const activeSlotsCount = day.slots.filter(s => s.active).length;

                return (
                  <button
                    key={day.id}
                    onClick={() => setSelectedDayId(day.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer text-center relative ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/15 text-white shadow-lg shadow-amber-500/10'
                        : 'border-zinc-800 bg-zinc-950/80 text-zinc-400 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    <span className="font-syne text-xs font-bold block">{day.label}</span>
                    <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">
                      {day.startHour} às {day.endHour}
                    </span>

                    <div className="mt-2 flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${day.enabled ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-red-500'}`} />
                      <span className="text-[9px] font-black uppercase tracking-wider text-zinc-300">
                        {day.enabled ? `${activeSlotsCount} livre(s)` : 'Inativo'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Selected Day Card */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-6">
            {/* Selected Day Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h4 className="font-syne text-xl font-extrabold text-white">{currentSelectedDay.label}</h4>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    {currentSelectedDay.startHour} às {currentSelectedDay.endHour}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Clique nos botões de horário para ativar ou desativar o atendimento naquele slot.
                </p>
              </div>

              {/* Toggle Full Day Button */}
              <button
                onClick={() => handleToggleDayEnabled(currentSelectedDay.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer border ${
                  currentSelectedDay.enabled
                    ? 'bg-red-500/15 text-red-300 border-red-500/40 hover:bg-red-500 hover:text-white'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500 hover:text-black'
                }`}
              >
                {currentSelectedDay.enabled ? (
                  <>
                    <X className="h-4 w-4" />
                    <span>Desativar Dia Completo ({currentSelectedDay.label})</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Ativar Dia Completo ({currentSelectedDay.label})</span>
                  </>
                )}
              </button>
            </div>

            {/* Disabled Day Warning Banner */}
            {!currentSelectedDay.enabled && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
                <span>⚠️ {currentSelectedDay.label.toUpperCase()} ESTÁ ATUALMENTE DESATIVADO. Nenhum cliente conseguirá realizar agendamentos neste dia da semana.</span>
              </div>
            )}

            {/* Form for Adding Extra Slot */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-950/70 border border-zinc-800 p-4 rounded-2xl">
              <div className="space-y-0.5">
                <label className="text-xs font-bold text-amber-400 block flex items-center gap-1.5">
                  <Plus className="h-4 w-4 text-amber-400" />
                  Acrescentar Horário Extra para {currentSelectedDay.label}
                </label>
                <p className="text-[11px] text-zinc-400">Insira um novo horário de atendimento específico (ex: 20:30, 21:00).</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={extraSlotInput}
                  onChange={(e) => setExtraSlotInput(e.target.value)}
                  placeholder="Ex: 20:30"
                  className="w-32 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white text-center focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => handleAddExtraSlot(currentSelectedDay.id)}
                  className="flex items-center gap-1 bg-gold-gradient text-zinc-950 font-extrabold text-xs px-4 py-2 rounded-xl hover:scale-105 transition-all cursor-pointer shrink-0 shadow-md shadow-amber-500/10"
                >
                  <Plus className="h-4 w-4" />
                  <span>Adicionar Extra</span>
                </button>
              </div>
            </div>

            {/* Slots Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Horários de {currentSelectedDay.label} ({currentSelectedDay.slots.length} slots)
                </span>
                <span className="text-[11px] text-zinc-500">
                  Clique no cartão para alternar [Ativo / Desativado]
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {currentSelectedDay.slots.map((slot) => {
                  const isSlotActive = slot.active && currentSelectedDay.enabled;

                  return (
                    <div
                      key={slot.time}
                      className={`relative group flex flex-col items-center justify-center rounded-2xl border p-4 transition-all ${
                        isSlotActive
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:border-amber-400'
                          : 'border-red-500/30 bg-red-500/10 text-red-400 hover:border-zinc-700'
                      }`}
                    >
                      {/* Delete Extra Slot Button */}
                      {slot.isExtra && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveExtraSlot(currentSelectedDay.id, slot.time);
                          }}
                          className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-zinc-950 border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                          title="Excluir Horário Extra"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}

                      <button
                        onClick={() => handleToggleSlotActive(currentSelectedDay.id, slot.time)}
                        className="w-full flex flex-col items-center justify-center cursor-pointer"
                      >
                        <Clock className="h-4 w-4 mb-1 text-amber-400" />
                        <span className={`font-syne text-base font-extrabold ${!isSlotActive ? 'line-through opacity-70' : ''}`}>
                          {slot.time}
                        </span>

                        <div className="flex items-center gap-1 mt-1.5">
                          {slot.isExtra && (
                            <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Extra
                            </span>
                          )}
                          <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            isSlotActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {isSlotActive ? 'Ativo' : 'Desativado'}
                          </span>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section for Date-specific overrides (Specific Date Picker / Calendar) */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <h4 className="font-syne text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-amber-400" />
                  Bloqueios de Exceção por Data Específica (Feriados e Eventos)
                </h4>
                <p className="text-xs text-zinc-400">
                  Selecione uma data para realizar bloqueios específicos sem alterar o padrão semanal.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-zinc-400 font-bold">Data Específica:</label>
                <input
                  type="date"
                  value={selectedScheduleDate}
                  onChange={(e) => setSelectedScheduleDate(e.target.value)}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {allTimeSlots.map((time) => {
                const isBlocked = blockedSlots.some(
                  (b) => b.date === selectedScheduleDate && b.timeSlot === time
                );

                const hasAppointment = appointments.some(
                  (a) => a.date === selectedScheduleDate && a.timeSlot === time && a.status !== 'cancelado'
                );

                return (
                  <button
                    key={time}
                    onClick={() => onToggleBlockSlot(selectedScheduleDate, time)}
                    className={`flex flex-col items-center justify-center rounded-2xl border p-3.5 transition-all cursor-pointer ${
                      hasAppointment
                        ? 'border-blue-500/40 bg-blue-500/10 text-blue-300'
                        : isBlocked
                        ? 'border-red-500/40 bg-red-500/20 text-red-300'
                        : 'border-zinc-800 bg-zinc-950/80 text-zinc-300 hover:border-amber-500'
                    }`}
                  >
                    <Clock className="h-4 w-4 mb-1 text-amber-400" />
                    <span className="font-syne text-sm font-extrabold">{time}</span>
                    <span className="text-[9px] uppercase font-bold mt-1">
                      {hasAppointment ? 'Agendado' : isBlocked ? 'Bloqueado' : 'Livre'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GESTÃO DE CORTES E PREÇOS */}
      {activeTab === 'servicos' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h3 className="font-syne text-xl font-bold text-white">Catálogo de Serviços & Preços</h3>
              <p className="text-xs text-zinc-400">Adicione, edite ou altere valores dos cortes oferecidos.</p>
            </div>

            <button
              onClick={() =>
                setEditingService({
                  id: 'srv-' + Math.random().toString(36).substring(2, 8),
                  name: '',
                  price: 40,
                  durationMinutes: 30,
                  description: '',
                  category: 'corte',
                  popular: false,
                })
              }
              className="flex items-center gap-1.5 rounded-xl bg-gold-gradient px-4 py-2 text-xs font-bold text-zinc-950 shadow-md shadow-amber-500/20 hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Serviço</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((srv) => (
              <div
                key={srv.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-3 transition-all hover:border-amber-500/40"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-amber-400 uppercase">
                      {srv.category}
                    </span>
                    <h4 className="mt-1 font-syne text-base font-bold text-white">{srv.name}</h4>
                  </div>
                  <span className="font-syne text-lg font-black text-gold-gradient">
                    R$ {srv.price.toFixed(2)}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2">{srv.description}</p>

                <div className="flex items-center justify-between border-t border-zinc-800 pt-3 text-xs text-zinc-400">
                  <span>{srv.durationMinutes} minutos</span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingService(srv)}
                      className="flex items-center gap-1 rounded bg-zinc-800 px-2.5 py-1 text-xs font-bold text-amber-400 hover:bg-zinc-700"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Editar
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`⚠️ ATENÇÃO: Tem certeza que deseja excluir o serviço "${srv.name}"?\n\nEsta ação removerá este serviço do catálogo.`)) {
                          onDeleteService(srv.id);
                        }
                      }}
                      className="rounded bg-zinc-800 p-1 text-zinc-500 hover:text-red-400 cursor-pointer"
                      title="Excluir Serviço"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Service Modal */}
          {editingService && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
                <h3 className="font-syne text-lg font-bold text-white">Editar / Criar Serviço</h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1">Nome do Corte/Serviço</label>
                    <input
                      type="text"
                      value={editingService.name || ''}
                      onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-400 block mb-1">Preço (R$)</label>
                      <input
                        type="number"
                        value={editingService.price || 0}
                        onChange={(e) => setEditingService({ ...editingService, price: parseFloat(e.target.value) })}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">Duração (Min)</label>
                      <input
                        type="number"
                        value={editingService.durationMinutes || 30}
                        onChange={(e) => setEditingService({ ...editingService, durationMinutes: parseInt(e.target.value) })}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Descrição</label>
                    <textarea
                      value={editingService.description || ''}
                      onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                      rows={2}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditingService(null)}
                    className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      if (editingService.name && editingService.price) {
                        onSaveService(editingService as Service);
                        setEditingService(null);
                      }
                    }}
                    className="rounded-xl bg-gold-gradient px-5 py-2 text-xs font-bold text-zinc-950"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: GESTÃO DE BARBEIROS */}
      {activeTab === 'barbeiros' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h3 className="font-syne text-xl font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-400" />
                Equipe & Gestão de Barbeiros
              </h3>
              <p className="text-xs text-zinc-400">
                Cadastre novos barbeiros, edite informações, ative/desative ou exclua profissionais da equipe.
              </p>
            </div>

            <button
              onClick={() =>
                setEditingBarber({
                  id: '',
                  name: '',
                  role: 'Barbeiro Specialist',
                  avatarUrl: '',
                  avatar: '',
                  rating: 5.0,
                  specialties: ['Degradê Navalhado', 'Barba Quadrada'],
                  status: 'active',
                  cpf: '',
                  cnpj: '',
                  email: '',
                  phone: '',
                  address: '',
                  pixKey: '',
                  salary: '',
                  serviceCommission: '',
                  salesCommission: '',
                  lunchBreak: '12:00 - 13:00'
                })
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-gold-gradient px-4 py-2.5 text-xs font-extrabold text-zinc-950 shadow-md shadow-amber-500/20 hover:scale-105 transition-all cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Cadastrar Novo Barbeiro</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {barbers.map((barber) => {
              const avatarSrc = barber.avatarUrl || barber.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400";
              const isActive = barber.status === 'active';

              return (
                <div
                  key={barber.id}
                  className={`flex flex-col justify-between rounded-2xl border transition-all p-5 space-y-4 ${
                    isActive
                      ? 'border-zinc-800 bg-zinc-900/80 hover:border-amber-500/40'
                      : 'border-zinc-800/60 bg-zinc-950/60 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header Top: Avatar, Name, Status Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={avatarSrc}
                          alt={barber.name}
                          className="h-14 w-14 rounded-2xl object-cover border-2 border-amber-500/30 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400";
                          }}
                        />
                        <div>
                          <h4 className="font-syne text-base font-extrabold text-white">{barber.name}</h4>
                          <p className="text-xs text-amber-400 font-bold">{barber.role || 'Barbeiro'}</p>
                          <span className="text-[10px] text-zinc-500 block">⭐ {barber.rating || 5.0} Avaliação</span>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}>
                        {isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    {/* Information Grid */}
                    <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/80 p-3 text-xs space-y-1.5 text-zinc-300">
                      {barber.specialties && barber.specialties.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-zinc-500 font-bold">Especialidade:</span>
                          {barber.specialties.map((spec, i) => (
                            <span key={i} className="bg-amber-500/10 text-amber-400 text-[10px] px-2 py-0.5 rounded font-bold border border-amber-500/20">
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}

                      {barber.phone && (
                        <p><strong className="text-zinc-400">WhatsApp/Tel:</strong> {barber.phone}</p>
                      )}
                      {barber.email && (
                        <p><strong className="text-zinc-400">Email:</strong> {barber.email}</p>
                      )}
                      {(barber.cpf || barber.cnpj) && (
                        <p><strong className="text-zinc-400">CPF/CNPJ:</strong> {barber.cpf || barber.cnpj}</p>
                      )}
                      {barber.pixKey && (
                        <p><strong className="text-zinc-400">Chave Pix:</strong> <span className="font-mono text-emerald-400">{barber.pixKey}</span></p>
                      )}
                      {barber.address && (
                        <p><strong className="text-zinc-400">Endereço:</strong> {barber.address}</p>
                      )}
                      {barber.lunchBreak && (
                        <p><strong className="text-zinc-400">Horário de Almoço:</strong> {barber.lunchBreak}</p>
                      )}
                      {(barber.salary || barber.serviceCommission || barber.salesCommission) && (
                        <div className="pt-1.5 border-t border-zinc-800/80 grid grid-cols-2 gap-1 text-[11px]">
                          {barber.salary && <div><span className="text-zinc-500 block">Salário Base:</span> <strong className="text-white">R$ {barber.salary}</strong></div>}
                          {barber.serviceCommission && <div><span className="text-zinc-500 block">Comissão Serviço:</span> <strong className="text-amber-400">{barber.serviceCommission}%</strong></div>}
                          {barber.salesCommission && <div><span className="text-zinc-500 block">Comissão Vendas:</span> <strong className="text-emerald-400">{barber.salesCommission}%</strong></div>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="grid grid-cols-3 gap-2 border-t border-zinc-800/80 pt-3">
                    <button
                      onClick={() => {
                        const newStatus = barber.status === 'active' ? 'inactive' : 'active';
                        onSaveBarber({ ...barber, status: newStatus });
                      }}
                      className={`py-2 px-2 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer text-center ${
                        isActive
                          ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
                      }`}
                    >
                      {isActive ? 'Desativar' : 'Ativar'}
                    </button>

                    <button
                      onClick={() => setEditingBarber(barber)}
                      className="flex items-center justify-center gap-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 py-2 px-2 text-[11px] font-bold text-white transition-all cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-amber-400" />
                      Editar
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja excluir o barbeiro ${barber.name}?`)) {
                          onDeleteBarber?.(barber.id);
                        }
                      }}
                      className="flex items-center justify-center gap-1 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500 hover:text-white py-2 px-2 text-[11px] font-bold text-red-400 transition-all cursor-pointer"
                      title="Excluir Barbeiro"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Excluir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal de Cadastro / Edição do Barbeiro */}
          {editingBarber && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md">
              <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-amber-500/30 bg-zinc-950 p-5 sm:p-6 shadow-2xl">
                {/* Header fixo */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4 shrink-0">
                  <div>
                    <h3 className="font-syne text-lg font-bold text-white flex items-center gap-2">
                      <Users className="h-5 w-5 text-amber-400" />
                      {editingBarber.id ? 'Editar Profissional' : 'Cadastrar Novo Barbeiro'}
                    </h3>
                    <p className="text-xs text-zinc-400">Preencha os dados do barbeiro abaixo.</p>
                  </div>

                  <button
                    onClick={() => setEditingBarber(null)}
                    className="p-1.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Corpo com scroll interno */}
                <div className="overflow-y-auto pr-1 py-4 flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Nome Completo - Destaque no topo */}
                    <div className="md:col-span-2 bg-amber-500/10 p-4 rounded-2xl border border-amber-500/30">
                      <label className="text-amber-400 font-extrabold block mb-1 text-sm">
                        Nome Completo do Barbeiro <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Digite aqui o nome completo do barbeiro..."
                        value={editingBarber.name || ''}
                        onChange={(e) => setEditingBarber({ ...editingBarber, name: e.target.value })}
                        autoFocus
                        className="w-full rounded-xl border border-amber-500/40 bg-zinc-900 p-3 text-white font-bold focus:border-amber-400 focus:outline-none text-sm"
                      />
                    </div>

                    {/* Avatar / Foto do Dispositivo */}
                    <div className="md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
                      <img
                        src={editingBarber.avatarUrl || editingBarber.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                        alt="Preview Foto"
                        className="h-20 w-20 rounded-2xl object-cover border-2 border-amber-500/40 shrink-0 shadow-md"
                      />
                      <div className="flex-1 space-y-2">
                        <label className="text-zinc-300 font-extrabold block text-xs">
                          Foto do Barbeiro (Selecione do Dispositivo)
                        </label>
                        <p className="text-[11px] text-zinc-400">
                          Escolha uma foto salva da galeria ou arquivos do seu dispositivo (celular/computador).
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-3.5 py-2 text-xs transition-colors shadow-lg shadow-amber-500/10 active:scale-95">
                            <Upload className="h-4 w-4" />
                            <span>{editingBarber.avatarUrl || editingBarber.avatar ? 'Alterar Foto do Dispositivo' : 'Escolher Foto do Dispositivo'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 15 * 1024 * 1024) {
                                    alert('⚠️ A imagem selecionada deve ter no máximo 15MB.');
                                    return;
                                  }
                                  try {
                                    const compressedBase64 = await compressImageFile(file, 400, 400, 0.75);
                                    setEditingBarber(prev => prev ? { ...prev, avatarUrl: compressedBase64, avatar: compressedBase64 } : null);
                                  } catch (err) {
                                    console.error('Erro ao processar imagem:', err);
                                    alert('Erro ao processar a imagem do dispositivo.');
                                  }
                                }
                              }}
                            />
                          </label>
                          {(editingBarber.avatarUrl || editingBarber.avatar) && (
                            <button
                              type="button"
                              onClick={() => setEditingBarber({ ...editingBarber, avatarUrl: '', avatar: '' })}
                              className="px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                            >
                              Remover Foto
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Cargo / Função */}
                    <div>
                      <label className="text-zinc-300 font-extrabold block mb-1">Cargo / Especialização</label>
                      <input
                        type="text"
                        placeholder="Ex: Master Barber, Barbeiro Senior"
                        value={editingBarber.role || ''}
                        onChange={(e) => setEditingBarber({ ...editingBarber, role: e.target.value })}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    {/* CPF */}
                    <div>
                      <label className="text-zinc-300 font-extrabold block mb-1">CPF</label>
                      <input
                        type="text"
                        placeholder="000.000.000-00"
                        value={editingBarber.cpf || ''}
                        onChange={(e) => setEditingBarber({ ...editingBarber, cpf: e.target.value })}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    {/* CNPJ */}
                    <div>
                      <label className="text-zinc-300 font-extrabold block mb-1">CNPJ</label>
                      <input
                        type="text"
                        placeholder="00.000.000/0001-00"
                        value={editingBarber.cnpj || ''}
                        onChange={(e) => setEditingBarber({ ...editingBarber, cnpj: e.target.value })}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-zinc-300 font-extrabold block mb-1">Email</label>
                      <input
                        type="email"
                        placeholder="barbeiro@email.com"
                        value={editingBarber.email || ''}
                        onChange={(e) => setEditingBarber({ ...editingBarber, email: e.target.value })}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    {/* Whatsapp */}
                    <div>
                      <label className="text-zinc-300 font-extrabold block mb-1">Whatsapp / Telefone</label>
                      <input
                        type="text"
                        placeholder="(11) 99999-9999"
                        value={editingBarber.phone || ''}
                        onChange={(e) => setEditingBarber({ ...editingBarber, phone: e.target.value })}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    {/* Endereço */}
                    <div className="md:col-span-2">
                      <label className="text-zinc-300 font-extrabold block mb-1">Endereço Residencial/Contato</label>
                      <input
                        type="text"
                        placeholder="Rua, Número, Bairro, Cidade - UF"
                        value={editingBarber.address || ''}
                        onChange={(e) => setEditingBarber({ ...editingBarber, address: e.target.value })}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    {/* Chave Pix */}
                    <div>
                      <label className="text-zinc-300 font-extrabold block mb-1">Chave Pix</label>
                      <input
                        type="text"
                        placeholder="CPF, Email, Celular ou Aleatória"
                        value={editingBarber.pixKey || ''}
                        onChange={(e) => setEditingBarber({ ...editingBarber, pixKey: e.target.value })}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none font-mono"
                      />
                    </div>

                    {/* Salário */}
                    <div>
                      <label className="text-zinc-300 font-extrabold block mb-1">Salário Base (R$)</label>
                      <input
                        type="text"
                        placeholder="Ex: 2500,00"
                        value={editingBarber.salary || ''}
                        onChange={(e) => setEditingBarber({ ...editingBarber, salary: e.target.value })}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    {/* Comissão de Serviço */}
                    <div>
                      <label className="text-zinc-300 font-extrabold block mb-1">Comissão de Serviço (%)</label>
                      <input
                        type="text"
                        placeholder="Ex: 50"
                        value={editingBarber.serviceCommission || ''}
                        onChange={(e) => setEditingBarber({ ...editingBarber, serviceCommission: e.target.value })}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    {/* Comissão de Vendas */}
                    <div>
                      <label className="text-zinc-300 font-extrabold block mb-1">Comissão de Vendas (%)</label>
                      <input
                        type="text"
                        placeholder="Ex: 10"
                        value={editingBarber.salesCommission || ''}
                        onChange={(e) => setEditingBarber({ ...editingBarber, salesCommission: e.target.value })}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    {/* Especialidades */}
                    <div>
                      <label className="text-zinc-300 font-extrabold block mb-1">Especialidades (separadas por vírgula)</label>
                      <input
                        type="text"
                        placeholder="Degradê, Barba, Visagismo, Corte Clássico"
                        value={Array.isArray(editingBarber.specialties) ? editingBarber.specialties.join(', ') : (editingBarber.specialties as unknown as string) || ''}
                        onChange={(e) => setEditingBarber({ ...editingBarber, specialties: e.target.value as unknown as string[] })}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    {/* Horário de Almoço com Relógio */}
                    <div className="md:col-span-2 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-amber-400 font-extrabold text-xs flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-400" />
                          Horário de Almoço (Escolha do Horário via Relógio)
                        </label>
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          🕒 {editingBarber.lunchBreak || '12:00 - 13:00'}
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-400">
                        Selecione no relógio os horários de início e fim da pausa para refeição. O sistema bloqueará agendamentos automaticamente neste intervalo com a observação &quot;Horário de almoço&quot;.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-zinc-300 block mb-1">⏰ Início do Almoço</label>
                          <input
                            type="time"
                            value={
                              editingBarber.lunchStart ||
                              (editingBarber.lunchBreak ? editingBarber.lunchBreak.split(/[-às]+/)[0]?.trim() : '12:00') ||
                              '12:00'
                            }
                            onChange={(e) => {
                              const newStart = e.target.value;
                              const currentEnd =
                                editingBarber.lunchEnd ||
                                (editingBarber.lunchBreak ? editingBarber.lunchBreak.split(/[-às]+/)[1]?.trim() : '13:00') ||
                                '13:00';
                              setEditingBarber({
                                ...editingBarber,
                                lunchStart: newStart,
                                lunchEnd: currentEnd,
                                lunchBreak: `${newStart} - ${currentEnd}`
                              });
                            }}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white font-mono font-bold focus:border-amber-500 focus:outline-none cursor-pointer text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-zinc-300 block mb-1">⏰ Fim do Almoço</label>
                          <input
                            type="time"
                            value={
                              editingBarber.lunchEnd ||
                              (editingBarber.lunchBreak ? editingBarber.lunchBreak.split(/[-às]+/)[1]?.trim() : '13:00') ||
                              '13:00'
                            }
                            onChange={(e) => {
                              const currentStart =
                                editingBarber.lunchStart ||
                                (editingBarber.lunchBreak ? editingBarber.lunchBreak.split(/[-às]+/)[0]?.trim() : '12:00') ||
                                '12:00';
                              const newEnd = e.target.value;
                              setEditingBarber({
                                ...editingBarber,
                                lunchStart: currentStart,
                                lunchEnd: newEnd,
                                lunchBreak: `${currentStart} - ${newEnd}`
                              });
                            }}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white font-mono font-bold focus:border-amber-500 focus:outline-none cursor-pointer text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status na Agenda */}
                    <div className="md:col-span-2">
                      <label className="text-zinc-300 font-extrabold block mb-1">Status na Agenda</label>
                      <select
                        value={editingBarber.status || 'active'}
                        onChange={(e) => setEditingBarber({ ...editingBarber, status: e.target.value as 'active' | 'inactive' | 'away' })}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none font-bold"
                      >
                        <option value="active">Ativo (Disponível para agendamento)</option>
                        <option value="inactive">Inativo (Indisponível)</option>
                        <option value="away">Ausente / Em Folga</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Rodapé fixo com botões */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800 shrink-0">
                  <button
                    onClick={() => setEditingBarber(null)}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-xs font-bold text-zinc-300 hover:bg-zinc-800 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      const trimmedName = (editingBarber.name || '').trim();
                      if (!trimmedName) {
                        alert('⚠️ Por favor, digite o nome completo do barbeiro.');
                        return;
                      }

                      const specArray = typeof editingBarber.specialties === 'string'
                        ? (editingBarber.specialties as string).split(',').map(s => s.trim()).filter(Boolean)
                        : (Array.isArray(editingBarber.specialties) ? editingBarber.specialties : ['Corte & Barba']);

                      const barberToSave: Barber = {
                        ...editingBarber,
                        id: editingBarber.id || 'brb-' + Math.random().toString(36).substring(2, 9),
                        name: trimmedName,
                        role: editingBarber.role || 'Barbeiro Specialist',
                        avatar: editingBarber.avatarUrl || editingBarber.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
                        avatarUrl: editingBarber.avatarUrl || editingBarber.avatar || "",
                        rating: editingBarber.rating || 5.0,
                        specialties: specArray.length > 0 ? specArray : ['Corte Clássico'],
                        status: editingBarber.status || 'active'
                      };

                      onSaveBarber(barberToSave);
                      setEditingBarber(null);
                    }}
                    className="rounded-xl bg-gold-gradient px-6 py-2.5 text-xs font-extrabold text-zinc-950 shadow-lg shadow-amber-500/20 hover:scale-105 transition-all cursor-pointer"
                  >
                    Salvar Profissional
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: FIREBASE READY PREVIEW */}
      {activeTab === 'firebase' && (
        <div className="space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 backdrop-blur-md">
          <div className="flex items-center gap-3 text-amber-400">
            <Database className="h-6 w-6" />
            <div>
              <h3 className="font-syne text-xl font-bold text-white">Esquematização Centralizada Firebase</h3>
              <p className="text-xs text-zinc-400">Estrutura pronta para conexão com o Firestore Database</p>
            </div>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            O sistema já está 100% esquematizado com o arquivo <code className="text-amber-400">firebase-blueprint.json</code>, pronto para receber o projeto Firebase e sincronizar os agendamentos via SDK do Google em nuvem.
          </p>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-[11px] text-zinc-300 space-y-2 overflow-x-auto">
            <div className="text-amber-400 font-bold">// Coleções mapeadas:</div>
            <div>• <strong className="text-white">/users/{`{userId}`}</strong> : Perfis de clientes e administradores</div>
            <div>• <strong className="text-white">/services/{`{serviceId}`}</strong> : Catálogo de cortes e preços da barbearia</div>
            <div>• <strong className="text-white">/appointments/{`{appointmentId}`}</strong> : Agendamentos centralizados com listener snapshot real-time</div>
          </div>
        </div>
      )}

      {/* TAB 6: CONFIGURAÇÕES DA PÁGINA INICIAL DO CLIENTE */}
      {activeTab === 'configuracoes' && (
        <div className="space-y-6 rounded-3xl border border-amber-500/30 bg-zinc-950 p-6 sm:p-8 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-syne text-xl font-extrabold text-white">Configurações da Página Inicial</h3>
                <p className="text-xs text-zinc-400">Edite todos os títulos, textos de recepção e informações exibidas para os clientes</p>
              </div>
            </div>

            <button
              onClick={handleSaveConfigSubmit}
              disabled={isSavingConfig}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-6 py-3 text-xs font-black text-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSavingConfig ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>

          {configSuccessMsg && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-300 flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>{configSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveConfigSubmit} className="space-y-8">
            {/* Bloco 1: Banner Principal (Hero - Imagem 1) */}
            <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <Layout className="h-4 w-4" /> 1. Banner Principal de Recepção (Topo)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block ml-1">
                    Selo / Badge Superior
                  </label>
                  <input
                    type="text"
                    value={configFormData.heroBadge || ''}
                    onChange={(e) => setConfigFormData({ ...configFormData, heroBadge: e.target.value })}
                    placeholder="Ex: PREMIUM EXPERIENCE"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block ml-1">
                    Texto do Botão Principal (CTA)
                  </label>
                  <input
                    type="text"
                    value={configFormData.ctaButtonText || ''}
                    onChange={(e) => setConfigFormData({ ...configFormData, ctaButtonText: e.target.value })}
                    placeholder="Ex: AGENDAR AGORA"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block ml-1">
                    Título Principal (Linha 1)
                  </label>
                  <input
                    type="text"
                    value={configFormData.heroTitleLine1 || ''}
                    onChange={(e) => setConfigFormData({ ...configFormData, heroTitleLine1: e.target.value })}
                    placeholder="Ex: O ESTILO QUE"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block ml-1">
                    Título Em Destaque Amarelo (Linha 2)
                  </label>
                  <input
                    type="text"
                    value={configFormData.heroTitleLine2 || ''}
                    onChange={(e) => setConfigFormData({ ...configFormData, heroTitleLine2: e.target.value })}
                    placeholder="Ex: VOCÊ MERECE."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-amber-400 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 font-black"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block ml-1">
                    Texto Abaixo do Botão Principal
                  </label>
                  <input
                    type="text"
                    value={configFormData.ctaSubtext || ''}
                    onChange={(e) => setConfigFormData({ ...configFormData, ctaSubtext: e.target.value })}
                    placeholder="Ex: RESERVA SIMPLES & RÁPIDA"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block ml-1">
                  Texto Descritivo de Recepção
                </label>
                <textarea
                  rows={3}
                  value={configFormData.heroDescription || ''}
                  onChange={(e) => setConfigFormData({ ...configFormData, heroDescription: e.target.value })}
                  placeholder="Agende seu horário com o mestre Jadson..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 leading-relaxed"
                />
              </div>
            </div>

            {/* Bloco 2: Pilares de Destaque (4 Ícones - Imagem 1) */}
            <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> 2. Pilares de Destaque da Recepção (4 Selos)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block ml-1">Selo 1</label>
                  <input
                    type="text"
                    value={configFormData.highlightsPill1 || ''}
                    onChange={(e) => setConfigFormData({ ...configFormData, highlightsPill1: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block ml-1">Selo 2</label>
                  <input
                    type="text"
                    value={configFormData.highlightsPill2 || ''}
                    onChange={(e) => setConfigFormData({ ...configFormData, highlightsPill2: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block ml-1">Selo 3</label>
                  <input
                    type="text"
                    value={configFormData.highlightsPill3 || ''}
                    onChange={(e) => setConfigFormData({ ...configFormData, highlightsPill3: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block ml-1">Selo 4</label>
                  <input
                    type="text"
                    value={configFormData.highlightsPill4 || ''}
                    onChange={(e) => setConfigFormData({ ...configFormData, highlightsPill4: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Bloco 3: Banner Final de Agendamento (Imagem 2) */}
            <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <FileText className="h-4 w-4" /> 3. Banner Final de Agendamento
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block ml-1">
                    Título do Banner Final
                  </label>
                  <input
                    type="text"
                    value={configFormData.bannerTitle || ''}
                    onChange={(e) => setConfigFormData({ ...configFormData, bannerTitle: e.target.value })}
                    placeholder="Ex: PRONTO PARA RENOVAR SEU VISUAL?"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 font-bold"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block ml-1">
                    Descrição do Banner Final
                  </label>
                  <textarea
                    rows={2}
                    value={configFormData.bannerDescription || ''}
                    onChange={(e) => setConfigFormData({ ...configFormData, bannerDescription: e.target.value })}
                    placeholder="Ex: Inicie nosso Agendamento Slim em 4 etapas simples..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500/50 leading-relaxed"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block ml-1">
                    Texto do Botão do Banner Final
                  </label>
                  <input
                    type="text"
                    value={configFormData.bannerButtonText || ''}
                    onChange={(e) => setConfigFormData({ ...configFormData, bannerButtonText: e.target.value })}
                    placeholder="Ex: INICIAR AGENDAMENTO AGORA"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Bloco 4: Dados da Barbearia & Rodapé (Imagem 2) */}
            <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <Building className="h-4 w-4" /> 4. Informações da Barbearia (Rodapé)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block ml-1">
                    Nome da Marca / Barbearia
                  </label>
                  <input
                    type="text"
                    value={configFormData.shopName || ''}
                    onChange={(e) => setConfigFormData({ ...configFormData, shopName: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block ml-1">
                    Subtítulo da Marca / Tagline
                  </label>
                  <input
                    type="text"
                    value={configFormData.shopTagline || ''}
                    onChange={(e) => setConfigFormData({ ...configFormData, shopTagline: e.target.value })}
                    placeholder="Ex: ATENDIMENTO SLIM VIP"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block ml-1">
                    Endereço Completo
                  </label>
                  <input
                    type="text"
                    value={configFormData.address || ''}
                    onChange={(e) => setConfigFormData({ ...configFormData, address: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block ml-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={configFormData.phone || ''}
                    onChange={(e) => setConfigFormData({ ...configFormData, phone: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block ml-1">
                    Perfil no Instagram
                  </label>
                  <input
                    type="text"
                    value={configFormData.instagram || ''}
                    onChange={(e) => setConfigFormData({ ...configFormData, instagram: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Configuração do Som de Notificação */}
            <SoundConfigSection
              soundSettings={soundSettings}
              onUpdateSettings={handleUpdateSoundSettings}
            />

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingConfig}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-8 py-4 text-sm font-black text-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-amber-500/10 cursor-pointer disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                <span>{isSavingConfig ? 'Salvando...' : 'Salvar Alterações da Página Inicial'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB: ESTOQUE INSUMOS */}
      {activeTab === 'insumos' && (
        <EstoqueInsumosTab
          insumosList={insumosList}
          insumoSearch={insumoSearch}
          setInsumoSearch={setInsumoSearch}
          insumoCategoryFilter={insumoCategoryFilter}
          setInsumoCategoryFilter={setInsumoCategoryFilter}
          editingInsumo={editingInsumo}
          setEditingInsumo={setEditingInsumo}
          isInsumoModalOpen={isInsumoModalOpen}
          setIsInsumoModalOpen={setIsInsumoModalOpen}
        />
      )}

      {/* TAB: PRODUTOS DE VENDA */}
      {activeTab === 'produtos' && (
        <ProdutosVendaTab
          produtosVendaList={produtosVendaList}
          produtoSearch={produtoSearch}
          setProdutoSearch={setProdutoSearch}
          produtoCategoryFilter={produtoCategoryFilter}
          setProdutoCategoryFilter={setProdutoCategoryFilter}
          editingProduto={editingProduto}
          setEditingProduto={setEditingProduto}
          isProdutoModalOpen={isProdutoModalOpen}
          setIsProdutoModalOpen={setIsProdutoModalOpen}
        />
      )}

      {/* Lateral Menu Overlay & Drawer (Menu Lateral ADM) */}
      {sidebarOpen && (
        <div className="fixed top-[73px] bottom-0 left-0 right-0 z-40 flex justify-start">
          {/* Backdrop Blur */}
          <div 
            className="fixed top-[73px] bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Left Drawer (Opens from left to right, up to 50% screen width, positioned below header) */}
          <aside className="relative z-10 w-1/2 min-w-[260px] max-w-[50vw] h-[calc(100vh-73px)] bg-zinc-950 border-r border-amber-500/20 p-4 sm:p-5 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300 ease-out overflow-hidden">
            {/* Drawer Header (Fixed) */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-syne text-sm font-bold text-white uppercase tracking-wider">
                    Painel Administrativo
                  </h2>
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Menu Lateral</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto pr-1 my-3 space-y-4">
              {/* User Account Info Card */}
              {currentUser && (
                <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-r from-zinc-900 to-zinc-950 p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <User className="h-3 w-3" /> Conta Administrador
                    </span>
                    <span className="text-[10px] bg-amber-400 text-black px-2 py-0.5 rounded-full font-black uppercase">
                      Ativa
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white leading-tight">{currentUser.name}</p>
                  <p className="text-xs text-zinc-400 truncate">{currentUser.email || 'admin@jadsonbarber.com'}</p>
                </div>
              )}

              {/* Navigation Tabs Links */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest block px-1">
                  Módulos de Gestão
                </span>

                <nav className="space-y-1.5">
                  <button
                    onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'dashboard'
                        ? 'bg-amber-400 text-black shadow-lg shadow-amber-500/10 font-extrabold'
                        : 'text-zinc-300 hover:bg-zinc-900 hover:text-white border border-transparent hover:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </button>

                  <button
                    onClick={() => { setActiveTab('agendamentos'); setSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'agendamentos'
                        ? 'bg-amber-400 text-black shadow-lg shadow-amber-500/10 font-extrabold'
                        : 'text-zinc-300 hover:bg-zinc-900 hover:text-white border border-transparent hover:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4" />
                      <span>Agendamentos</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      activeTab === 'agendamentos' ? 'bg-black/20 text-black' : 'bg-zinc-800 text-amber-400'
                    }`}>
                      {appointments.length}
                    </span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('clientes'); setSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'clientes'
                        ? 'bg-amber-400 text-black shadow-lg shadow-amber-500/10 font-extrabold'
                        : 'text-zinc-300 hover:bg-zinc-900 hover:text-white border border-transparent hover:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <UserCheck className="h-4 w-4" />
                      <span>Clientes Cadastrados</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      activeTab === 'clientes' ? 'bg-black/20 text-black' : 'bg-zinc-800 text-amber-400'
                    }`}>
                      {clientList.length}
                    </span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('horarios'); setSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'horarios'
                        ? 'bg-amber-400 text-black shadow-lg shadow-amber-500/10 font-extrabold'
                        : 'text-zinc-300 hover:bg-zinc-900 hover:text-white border border-transparent hover:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4" />
                      <span>Horários</span>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </button>

                  <button
                    onClick={() => { setActiveTab('servicos'); setSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'servicos'
                        ? 'bg-amber-400 text-black shadow-lg shadow-amber-500/10 font-extrabold'
                        : 'text-zinc-300 hover:bg-zinc-900 hover:text-white border border-transparent hover:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Scissors className="h-4 w-4" />
                      <span>Cortes & Preços</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      activeTab === 'servicos' ? 'bg-black/20 text-black' : 'bg-zinc-800 text-amber-400'
                    }`}>
                      {services.length}
                    </span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('barbeiros'); setSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'barbeiros'
                        ? 'bg-amber-400 text-black shadow-lg shadow-amber-500/10 font-extrabold'
                        : 'text-zinc-300 hover:bg-zinc-900 hover:text-white border border-transparent hover:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4" />
                      <span>Barbeiros</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      activeTab === 'barbeiros' ? 'bg-black/20 text-black' : 'bg-zinc-800 text-amber-400'
                    }`}>
                      {barbers.length}
                    </span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('insumos'); setSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'insumos'
                        ? 'bg-amber-400 text-black shadow-lg shadow-amber-500/10 font-extrabold'
                        : 'text-zinc-300 hover:bg-zinc-900 hover:text-white border border-transparent hover:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4" />
                      <span>Estoque Insumos</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      activeTab === 'insumos' ? 'bg-black/20 text-black' : 'bg-zinc-800 text-amber-400'
                    }`}>
                      {insumosList.length}
                    </span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('produtos'); setSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'produtos'
                        ? 'bg-amber-400 text-black shadow-lg shadow-amber-500/10 font-extrabold'
                        : 'text-zinc-300 hover:bg-zinc-900 hover:text-white border border-transparent hover:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="h-4 w-4" />
                      <span>Produtos de Venda</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      activeTab === 'produtos' ? 'bg-black/20 text-black' : 'bg-zinc-800 text-amber-400'
                    }`}>
                      {produtosVendaList.length}
                    </span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('configuracoes'); setSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'configuracoes'
                        ? 'bg-amber-400 text-black shadow-lg shadow-amber-500/10 font-extrabold'
                        : 'text-zinc-300 hover:bg-zinc-900 hover:text-white border border-transparent hover:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="h-4 w-4" />
                      <span>Configurações</span>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </button>
                </nav>
              </div>
            </div>

            {/* Footer Area with Fixed "Sair da Conta" Button */}
            <div className="pt-3 border-t border-zinc-800 shrink-0">
              {onLogout && (
                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 py-2.5 text-xs font-bold text-red-400 hover:text-red-300 hover:border-red-500/60 transition-all uppercase tracking-wider cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair da Conta</span>
                </button>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Sound Settings Modal */}
      {isSoundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-amber-500/30 rounded-2xl p-5 sm:p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Volume2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-syne text-base font-bold text-white uppercase tracking-wider">
                    Configuração do Sinal Sonoro
                  </h2>
                  <p className="text-xs text-amber-400 font-medium">Agendamentos em Tempo Real</p>
                </div>
              </div>
              <button
                onClick={() => setIsSoundModalOpen(false)}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <SoundConfigSection
              soundSettings={soundSettings}
              onUpdateSettings={handleUpdateSoundSettings}
            />

            <div className="flex justify-end border-t border-zinc-800 pt-4">
              <button
                type="button"
                onClick={() => setIsSoundModalOpen(false)}
                className="rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-extrabold text-black uppercase tracking-wider hover:bg-amber-400 transition-colors shadow-lg cursor-pointer"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function SoundConfigSection({
  soundSettings,
  onUpdateSettings,
}: {
  soundSettings: SoundSettings;
  onUpdateSettings: (newSettings: SoundSettings) => void;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 space-y-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
            <Volume2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-syne text-sm font-bold text-white uppercase tracking-wider">
              Efeito Sonoro de Agendamentos
            </h3>
            <p className="text-xs text-zinc-400">
              Notificação emitida automaticamente ao receber um novo agendamento com o Administrador logado.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => playAppointmentNotificationSound(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Volume2 className="h-4 w-4" />
          <span>Testar Som Agora</span>
        </button>
      </div>

      {/* Ativar / Desativar */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
          Status da Notificação Sonora
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onUpdateSettings({ ...soundSettings, enabled: true })}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
              soundSettings.enabled
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-md'
                : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <Volume2 className="h-4 w-4" />
            <span>Som Ativado</span>
            {soundSettings.enabled && <Check className="h-4 w-4 ml-1" />}
          </button>

          <button
            type="button"
            onClick={() => onUpdateSettings({ ...soundSettings, enabled: false })}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
              !soundSettings.enabled
                ? 'border-red-500 bg-red-500/10 text-red-400 shadow-md'
                : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <VolumeX className="h-4 w-4" />
            <span>Som Desativado</span>
            {!soundSettings.enabled && <Check className="h-4 w-4 ml-1" />}
          </button>
        </div>
      </div>

      {/* Origem do Som */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
          Origem do Efeito Sonoro
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Opção 1: Som Padrão */}
          <div
            onClick={() => onUpdateSettings({ ...soundSettings, soundType: 'default' })}
            className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
              soundSettings.soundType === 'default'
                ? 'border-amber-500 bg-amber-500/10 text-white shadow-lg'
                : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="font-extrabold text-xs text-white">Som Padrão (Barbarium Chime)</span>
              </div>
              {soundSettings.soundType === 'default' && (
                <span className="text-[10px] font-black uppercase bg-amber-400 text-black px-2 py-0.5 rounded-full">
                  Ativo
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400">
              Sinal sonoro padrão da barbearia (Harmonia tripla de alta nitidez). Som original já integrado.
            </p>
          </div>

          {/* Opção 2: Som do Dispositivo */}
          <div
            onClick={() => onUpdateSettings({ ...soundSettings, soundType: 'custom' })}
            className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
              soundSettings.soundType === 'custom'
                ? 'border-amber-500 bg-amber-500/10 text-white shadow-lg'
                : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-amber-400" />
                <span className="font-extrabold text-xs text-white">Áudio do Dispositivo</span>
              </div>
              {soundSettings.soundType === 'custom' && (
                <span className="text-[10px] font-black uppercase bg-amber-400 text-black px-2 py-0.5 rounded-full">
                  Ativo
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400">
              Carregue um arquivo de áudio (MP3, WAV, OGG, M4A) da memória do seu celular ou computador.
            </p>
          </div>
        </div>

        {/* Upload Box do Dispositivo */}
        {soundSettings.soundType === 'custom' && (
          <div className="mt-3 bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-zinc-300">
                Arquivo Carregado:
              </span>
              {soundSettings.customSoundName ? (
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30 truncate max-w-[240px]">
                  🎵 {soundSettings.customSoundName}
                </span>
              ) : (
                <span className="text-xs text-amber-400/80 italic font-semibold">
                  Nenhum arquivo de áudio carregado ainda
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-4 py-2.5 text-xs transition-colors shadow-lg shadow-amber-500/10 active:scale-95">
                <Upload className="h-4 w-4" />
                <span>{soundSettings.customSoundUrl ? 'Substituir Áudio do Dispositivo' : 'Carregar Áudio do Dispositivo (MP3/WAV)'}</span>
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 8 * 1024 * 1024) {
                        alert('⚠️ O arquivo de áudio deve ter no máximo 8MB.');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const base64Data = event.target?.result as string;
                        if (base64Data) {
                          onUpdateSettings({
                            ...soundSettings,
                            soundType: 'custom',
                            customSoundUrl: base64Data,
                            customSoundName: file.name
                          });
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>

              {soundSettings.customSoundUrl && (
                <button
                  type="button"
                  onClick={() => {
                    onUpdateSettings({
                      ...soundSettings,
                      soundType: 'default',
                      customSoundUrl: '',
                      customSoundName: ''
                    });
                  }}
                  className="px-3.5 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-400 transition-colors cursor-pointer"
                >
                  Restaurar Som Padrão
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
