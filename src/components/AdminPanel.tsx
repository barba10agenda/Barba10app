import React, { useState } from 'react';
import { 
  ShieldCheck, Calendar, Clock, DollarSign, Users, Scissors, 
  Check, X, AlertCircle, Plus, Edit3, Trash2, Phone, Search, Radio, Database, Sparkles
} from 'lucide-react';
import { Appointment, Service, Barber, BlockedSlot, AppointmentStatus } from '../types';
import { GENERATE_TIME_SLOTS } from '../services/store';

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
  realtimeActive: boolean;
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
  realtimeActive,
}) => {
  const [activeTab, setActiveTab] = useState<'agendamentos' | 'horarios' | 'servicos' | 'barbeiros' | 'firebase'>('agendamentos');

  // Filters for Appointments Tab
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Schedule Management State
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedScheduleDate, setSelectedScheduleDate] = useState<string>(todayStr);

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

  const allTimeSlots = GENERATE_TIME_SLOTS();

  return (
    <div className="space-y-8 pb-16">
      
      {/* Admin Panel Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-amber-500/30 bg-zinc-950 p-6 sm:p-8 shadow-2xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
            <ShieldCheck className="h-4 w-4" />
            <span>PAINEL ADMINISTRATIVO • JADSON BARBER</span>
          </div>
          <h1 className="font-syne text-2xl font-extrabold text-white sm:text-3xl">
            Gestão Centralizada em Tempo Real
          </h1>
          <p className="text-xs text-zinc-400">
            Gerencie agendamentos de clientes, horários disponíveis, valores de cortes e equipe de barbeiros.
          </p>
        </div>

        {/* Real-Time Status Card */}
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/90 px-4 py-3">
          <div className="relative flex h-3 w-3">
            <span className={`absolute inline-flex h-full w-full rounded-full ${realtimeActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            <span className={`relative inline-flex h-3 w-3 rounded-full ${realtimeActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 uppercase font-bold block">Base Centralizada</span>
            <span className="text-xs font-extrabold text-white">
              {realtimeActive ? 'Sincronização Ativa (Live)' : 'Conectado'}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase">Agendamentos Hoje</span>
            <Calendar className="h-4 w-4 text-amber-400" />
          </div>
          <p className="font-syne text-2xl font-extrabold text-white">{todayAppointments.length}</p>
          <span className="text-[10px] text-zinc-500 block">Total de clientes para hoje</span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase">Receita Estimada</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="font-syne text-2xl font-extrabold text-emerald-400">R$ {totalRevenue.toFixed(2)}</p>
          <span className="text-[10px] text-zinc-500 block">Confirmados e concluídos</span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase">Status Ativos</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-amber-400">{confirmedCount} Confirmados</span>
            <span className="text-zinc-600">•</span>
            <span className="text-emerald-400">{completedCount} Concluídos</span>
          </div>
          <span className="text-[10px] text-zinc-500 block">Fila de atendimento</span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase">Barbeiros Ativos</span>
            <Users className="h-4 w-4 text-amber-400" />
          </div>
          <p className="font-syne text-2xl font-extrabold text-white">{barbers.length}</p>
          <span className="text-[10px] text-zinc-500 block">Equipe de atendimento</span>
        </div>
      </div>

      {/* Admin Tabs Navigation */}
      <div className="flex border-b border-zinc-800 overflow-x-auto">
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
          onClick={() => setActiveTab('horarios')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-extrabold transition-all shrink-0 ${
            activeTab === 'horarios'
              ? 'border-amber-400 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Clock className="h-4 w-4" />
          Horários & Bloqueios
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
          onClick={() => setActiveTab('firebase')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-extrabold transition-all shrink-0 ${
            activeTab === 'firebase'
              ? 'border-amber-400 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Database className="h-4 w-4 text-amber-400" />
          Conexão Firebase
        </button>
      </div>

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

      {/* TAB 2: GESTÃO DE HORÁRIOS & BLOQUEIOS */}
      {activeTab === 'horarios' && (
        <div className="space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h3 className="font-syne text-xl font-bold text-white">Gerenciador de Horários e Bloqueios</h3>
              <p className="text-xs text-zinc-400">
                Selecione uma data e clique nos horários para bloquear ou liberar em tempo real para os clientes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-400 font-bold">Data:</label>
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
                  className={`flex flex-col items-center justify-center rounded-2xl border p-4 transition-all ${
                    hasAppointment
                      ? 'border-blue-500/40 bg-blue-500/10 text-blue-300'
                      : isBlocked
                      ? 'border-red-500/40 bg-red-500/20 text-red-300'
                      : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:border-amber-500'
                  }`}
                >
                  <Clock className="h-4 w-4 mb-1" />
                  <span className="font-syne text-sm font-extrabold">{time}</span>
                  <span className="text-[9px] uppercase font-bold mt-1">
                    {hasAppointment ? 'Agendado' : isBlocked ? 'Bloqueado' : 'Livre'}
                  </span>
                </button>
              );
            })}
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
                      onClick={() => onDeleteService(srv.id)}
                      className="rounded bg-zinc-800 p-1 text-zinc-500 hover:text-red-400"
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
          <div className="border-b border-zinc-800 pb-4">
            <h3 className="font-syne text-xl font-bold text-white">Equipe de Barbeiros</h3>
            <p className="text-xs text-zinc-400">Status dos profissionais disponíveis no sistema de agendamento.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {barbers.map((barber) => (
              <div
                key={barber.id}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <img src={barber.avatar} alt={barber.name} className="h-12 w-12 rounded-xl object-cover" />
                  <div>
                    <h4 className="font-syne text-sm font-bold text-white">{barber.name}</h4>
                    <p className="text-xs text-amber-400 font-semibold">{barber.role}</p>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-zinc-400">
                  <p>Especialidades: {barber.specialties.join(', ')}</p>
                  <p>Avaliação: ⭐ {barber.rating}</p>
                </div>

                <button
                  onClick={() => {
                    const newStatus = barber.status === 'active' ? 'away' : 'active';
                    onSaveBarber({ ...barber, status: newStatus });
                  }}
                  className={`w-full rounded-xl py-2 text-xs font-bold transition-colors ${
                    barber.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {barber.status === 'active' ? 'Ativo na Agenda' : 'Ausente / Em Folga'}
                </button>
              </div>
            ))}
          </div>
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
    </div>
  );
};
