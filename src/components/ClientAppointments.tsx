import React, { useState } from 'react';
import { 
  CalendarCheck2, Clock, User, Scissors, XCircle, ChevronLeft, Edit3, Calendar, Check, X, AlertCircle 
} from 'lucide-react';
import { Appointment, UserAccount, Service, Barber, BlockedSlot } from '../types';
import { GENERATE_TIME_SLOTS } from '../services/store';
import { isBarberInLunchBreak } from '../utils/lunchBreak';

interface ClientAppointmentsProps {
  currentUser: UserAccount;
  appointments: Appointment[];
  services?: Service[];
  barbers?: Barber[];
  blockedSlots?: BlockedSlot[];
  onCancelAppointment: (id: string) => void;
  onUpdateAppointment?: (id: string, updates: Partial<Appointment>) => void;
  onBackToHome: () => void;
}

export const ClientAppointments: React.FC<ClientAppointmentsProps> = ({
  currentUser,
  appointments,
  services = [],
  barbers = [],
  blockedSlots = [],
  onCancelAppointment,
  onUpdateAppointment,
  onBackToHome,
}) => {
  // Filter appointments for current client
  const myBookings = appointments.filter(
    (apt) => apt.clientId === currentUser.id || apt.clientEmail === currentUser.email || (currentUser.phone && apt.clientPhone === currentUser.phone)
  );

  // Modal States
  const [editingServiceApt, setEditingServiceApt] = useState<Appointment | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  const [reschedulingApt, setReschedulingApt] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleTimeSlot, setRescheduleTimeSlot] = useState<string>('');
  const [rescheduleBarberId, setRescheduleBarberId] = useState<string>('');

  // Open Edit Service Modal
  const handleOpenEditService = (apt: Appointment) => {
    setEditingServiceApt(apt);
    if (apt.serviceIds && apt.serviceIds.length > 0) {
      setSelectedServiceIds(apt.serviceIds);
    } else if (apt.serviceId) {
      setSelectedServiceIds([apt.serviceId]);
    } else {
      setSelectedServiceIds(services[0] ? [services[0].id] : []);
    }
  };

  // Toggle service selection in edit modal
  const handleToggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) => {
      if (prev.includes(serviceId)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((id) => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  // Save Service Edit
  const handleSaveServiceEdit = () => {
    if (!editingServiceApt || !onUpdateAppointment) return;
    const selectedSrvs = services.filter((s) => selectedServiceIds.includes(s.id));
    if (selectedSrvs.length === 0) {
      alert('Selecione ao menos um serviço.');
      return;
    }

    const totalPrice = selectedSrvs.reduce((sum, s) => sum + s.price, 0);
    const totalDuration = selectedSrvs.reduce((sum, s) => sum + s.durationMinutes, 0);
    const combinedNames = selectedSrvs.map((s) => s.name).join(' + ');

    onUpdateAppointment(editingServiceApt.id, {
      serviceId: selectedSrvs[0].id,
      serviceIds: selectedServiceIds,
      serviceName: combinedNames,
      servicePrice: totalPrice,
      serviceDuration: totalDuration,
    });

    setEditingServiceApt(null);
  };

  // Open Reschedule Modal
  const handleOpenReschedule = (apt: Appointment) => {
    setReschedulingApt(apt);
    setRescheduleDate(apt.date);
    setRescheduleTimeSlot(apt.timeSlot);
    setRescheduleBarberId(apt.barberId);
  };

  // Date helper for next 7 days
  const todayDate = new Date();
  const formatDateISO = (d: Date) => d.toISOString().split('T')[0];
  const availableDates = Array.from({ length: 8 }, (_, i) => {
    const d = new Date();
    d.setDate(todayDate.getDate() + i);
    return {
      iso: formatDateISO(d),
      dayName: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
      dayNum: d.getDate(),
      monthName: d.toLocaleDateString('pt-BR', { month: 'short' }),
      isToday: i === 0,
    };
  });

  const allTimeSlots = GENERATE_TIME_SLOTS();

  const isPastTimeSlot = (dateIso: string, timeSlot: string) => {
    const now = new Date();
    const todayIso = formatDateISO(now);

    if (dateIso < todayIso) return true;
    if (dateIso > todayIso) return false;

    const [slotHour, slotMin] = timeSlot.split(':').map(Number);
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    if (slotHour < currentHour) return true;
    if (slotHour === currentHour && slotMin <= currentMin) return true;
    return false;
  };

  const isRescheduleSlotOccupied = (timeSlot: string) => {
    if (!reschedulingApt) return false;

    // Past time slot check
    if (isPastTimeSlot(rescheduleDate, timeSlot)) return true;

    // Check bookings other than current appointment
    const hasBooking = appointments.some(
      (apt) =>
        apt.id !== reschedulingApt.id &&
        apt.date === rescheduleDate &&
        apt.timeSlot === timeSlot &&
        apt.barberId === rescheduleBarberId &&
        apt.status !== 'cancelado'
    );

    const isBlocked = blockedSlots.some(
      (blk) =>
        blk.date === rescheduleDate &&
        blk.timeSlot === timeSlot &&
        (!blk.barberId || blk.barberId === rescheduleBarberId)
    );

    const selBarber = barbers.find((b) => b.id === rescheduleBarberId);
    const inLunch = selBarber
      ? isBarberInLunchBreak(timeSlot, selBarber.lunchBreak, selBarber.lunchStart, selBarber.lunchEnd)
      : false;

    return hasBooking || isBlocked || inLunch;
  };

  const visibleRescheduleSlots = rescheduleDate
    ? allTimeSlots.filter((t) => !isPastTimeSlot(rescheduleDate, t))
    : [];

  const rescheduleTurnos = [
    {
      id: 'manha',
      label: 'Manhã',
      icon: '☀️',
      slots: visibleRescheduleSlots.filter((t) => parseInt(t.split(':')[0], 10) < 12),
    },
    {
      id: 'tarde',
      label: 'Tarde',
      icon: '🌤️',
      slots: visibleRescheduleSlots.filter((t) => {
        const h = parseInt(t.split(':')[0], 10);
        return h >= 12 && h < 18;
      }),
    },
    {
      id: 'noite',
      label: 'Noite',
      icon: '🌙',
      slots: visibleRescheduleSlots.filter((t) => parseInt(t.split(':')[0], 10) >= 18),
    },
  ].filter((t) => t.slots.length > 0);

  // Save Reschedule
  const handleSaveReschedule = () => {
    if (!reschedulingApt || !onUpdateAppointment) return;
    if (!rescheduleDate || !rescheduleTimeSlot || !rescheduleBarberId) {
      alert('Por favor escolha a data, horário e barbeiro.');
      return;
    }

    const selBarber = barbers.find((b) => b.id === rescheduleBarberId);

    onUpdateAppointment(reschedulingApt.id, {
      date: rescheduleDate,
      timeSlot: rescheduleTimeSlot,
      barberId: rescheduleBarberId,
      barberName: selBarber ? selBarber.name : reschedulingApt.barberName,
    });

    setReschedulingApt(null);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <button
            onClick={onBackToHome}
            className="mb-2 flex items-center gap-1 text-xs font-bold text-yellow-400 hover:text-yellow-300 uppercase tracking-widest cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" /> Voltar ao Início
          </button>
          <h2 className="font-syne text-xl sm:text-3xl font-black uppercase tracking-tight text-white">Meus Agendamentos</h2>
          <p className="text-xs text-gray-400">
            Acompanhe, edite serviços, reagende ou cancele seus horários na Jadson Barber Slim.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0F0F0F] px-4 py-2.5 text-left sm:text-right self-start sm:self-auto shrink-0">
          <span className="text-[10px] text-gray-500 block font-bold uppercase tracking-widest">Total</span>
          <span className="font-syne text-xl font-black text-yellow-400">{myBookings.length}</span>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="rounded-2xl border border-yellow-500/20 bg-gradient-to-r from-zinc-900 to-zinc-950 p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-bold text-lg shrink-0">
            <User className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-syne text-base sm:text-lg font-bold text-white truncate max-w-[220px] sm:max-w-none">{currentUser.name}</h3>
              {currentUser.email?.includes('gmail.com') && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-yellow-400 border border-yellow-500/20 shrink-0">
                  Google
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 truncate">{currentUser.email || 'Conta cadastrada'}</p>
            {currentUser.phone && (
              <p className="text-[11px] text-gray-500 truncate">{currentUser.phone}</p>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-400 bg-white/5 rounded-xl px-3 py-2 border border-white/5 w-full sm:w-auto text-left sm:text-right">
          <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest block">Status do Perfil</span>
          <span className="text-white font-bold">Cliente Conectado</span>
        </div>
      </div>

      {myBookings.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-12 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 text-amber-400">
            <CalendarCheck2 className="h-8 w-8" />
          </div>
          <h3 className="font-syne text-lg font-bold text-white">Você não possui agendamentos ativos</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Escolha seu corte, barbeiro e horário ideal para iniciar seu agendamento.
          </p>
          <button
            onClick={onBackToHome}
            className="rounded-xl bg-yellow-400 px-6 py-2.5 text-xs font-extrabold text-black shadow-md hover:bg-yellow-300 transition-colors"
          >
            AGENDAR AGORA
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myBookings.map((apt) => (
            <div
              key={apt.id}
              className="relative rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-4 transition-all hover:border-amber-500/40"
            >
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Scissors className="h-4 w-4" />
                  <span>Jadson Barber Slim</span>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                    apt.status === 'confirmado'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : apt.status === 'pendente'
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                      : apt.status === 'concluido'
                      ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                      : 'bg-red-500/10 border border-red-500/30 text-red-400'
                  }`}
                >
                  {apt.status}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2 border-b border-zinc-800/60 pb-2">
                  <div>
                    <span className="text-zinc-500 text-[10px] block font-bold uppercase">Cliente</span>
                    <strong className="text-white text-xs">{apt.clientName || currentUser.name}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px] block font-bold uppercase">E-mail</span>
                    <span className="text-zinc-400 text-xs truncate block">{apt.clientEmail || currentUser.email}</span>
                  </div>
                </div>

                <div>
                  <span className="text-zinc-500 text-[10px] block font-bold uppercase">Serviço(s)</span>
                  <strong className="text-white text-sm">{apt.serviceName}</strong>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-zinc-500 text-[10px] block font-bold uppercase">Barbeiro</span>
                    <strong className="text-amber-400">{apt.barberName}</strong>
                  </div>

                  <div>
                    <span className="text-zinc-500 text-[10px] block font-bold uppercase">Data & Horário</span>
                    <strong className="text-white">{apt.date} às {apt.timeSlot}</strong>
                  </div>
                </div>
              </div>

              {/* Action buttons: Edit Service, Reschedule, Cancel */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800/80 pt-3">
                <div>
                  <span className="text-[10px] text-zinc-500 block font-bold uppercase">Valor</span>
                  <span className="font-syne text-lg font-bold text-yellow-400">
                    R$ {apt.servicePrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {apt.status !== 'cancelado' && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Editar Serviço */}
                    {onUpdateAppointment && services.length > 0 && (
                      <button
                        onClick={() => handleOpenEditService(apt)}
                        className="flex items-center gap-1 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-1.5 text-xs font-bold text-yellow-400 hover:bg-yellow-500/20 transition-all cursor-pointer"
                        title="Editar Serviço"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Editar</span>
                      </button>
                    )}

                    {/* Reagendar */}
                    {onUpdateAppointment && (
                      <button
                        onClick={() => handleOpenReschedule(apt)}
                        className="flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1.5 text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition-all cursor-pointer"
                        title="Reagendar Data / Horário"
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Reagendar</span>
                      </button>
                    )}

                    {/* Cancelar */}
                    <button
                      onClick={() => {
                        if (confirm('Deseja realmente cancelar este agendamento?')) {
                          onCancelAppointment(apt.id);
                        }
                      }}
                      className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                      title="Cancelar Agendamento"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Cancelar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: EDITAR SERVIÇO */}
      {editingServiceApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-yellow-500/30 bg-zinc-950 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-yellow-400" />
                <h3 className="font-syne text-lg font-bold text-white uppercase tracking-tight">Editar Serviço</h3>
              </div>
              <button
                onClick={() => setEditingServiceApt(null)}
                className="rounded-lg p-1 text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Selecione 1 ou mais serviços para o agendamento do dia <strong className="text-white">{editingServiceApt.date} às {editingServiceApt.timeSlot}</strong>.
            </p>

            {/* List of services */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {services.map((srv) => {
                const isSelected = selectedServiceIds.includes(srv.id);
                return (
                  <div
                    key={srv.id}
                    onClick={() => handleToggleService(srv.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-yellow-400 bg-yellow-500/15 text-white'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <h4 className="font-syne text-xs font-bold text-white">{srv.name}</h4>
                      <p className="text-[11px] text-zinc-400">{srv.durationMinutes} min</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-syne text-xs font-bold text-yellow-400">
                        R$ {srv.price.toFixed(2).replace('.', ',')}
                      </span>
                      <div className={`flex h-5 w-5 items-center justify-center rounded border ${
                        isSelected ? 'bg-yellow-400 border-yellow-400 text-black font-bold' : 'border-zinc-700 bg-zinc-800'
                      }`}>
                        {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total summary */}
            <div className="rounded-xl border border-white/10 bg-zinc-900 p-3.5 flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-bold uppercase tracking-wider">Novo Total:</span>
              <span className="font-syne text-base font-black text-yellow-400">
                R$ {services
                  .filter((s) => selectedServiceIds.includes(s.id))
                  .reduce((sum, s) => sum + s.price, 0)
                  .toFixed(2)
                  .replace('.', ',')}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setEditingServiceApt(null)}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveServiceEdit}
                className="rounded-xl bg-yellow-400 px-5 py-2 text-xs font-black uppercase tracking-wider text-black hover:bg-yellow-300 shadow-md"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REAGENDAR HORÁRIO */}
      {reschedulingApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl border border-blue-500/30 bg-zinc-950 p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-400" />
                <h3 className="font-syne text-lg font-bold text-white uppercase tracking-tight">Reagendar Agendamento</h3>
              </div>
              <button
                onClick={() => setReschedulingApt(null)}
                className="rounded-lg p-1 text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Barber selection */}
            {barbers.length > 0 && (
              <div>
                <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-2">
                  Selecione o Barbeiro
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {barbers.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setRescheduleBarberId(b.id)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-bold transition-all ${
                        rescheduleBarberId === b.id
                          ? 'border-blue-400 bg-blue-500/20 text-blue-300'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <img src={b.avatar} alt={b.name} className="h-6 w-6 rounded-full object-cover shrink-0" />
                      <span className="truncate">{b.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date Ribbon */}
            <div>
              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-2">
                Selecione a Nova Data
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {availableDates.map((item) => {
                  const isSelected = rescheduleDate === item.iso;
                  return (
                    <button
                      key={item.iso}
                      type="button"
                      onClick={() => {
                        setRescheduleDate(item.iso);
                        setRescheduleTimeSlot('');
                      }}
                      className={`flex min-w-[70px] flex-col items-center rounded-xl border p-2.5 transition-all ${
                        isSelected
                          ? 'border-blue-400 bg-blue-400 text-black font-extrabold shadow-md'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <span className="text-[9px] uppercase font-bold">
                        {item.isToday ? 'Hoje' : item.dayName}
                      </span>
                      <span className="font-syne text-base font-black">{item.dayNum}</span>
                      <span className="text-[8px] uppercase font-semibold">{item.monthName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Grid grouped by Turnos */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">
                Selecione o Novo Horário ({rescheduleDate})
              </label>

              {rescheduleTurnos.map((turno) => (
                <div key={turno.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                    <span>{turno.icon}</span>
                    <span className="text-blue-400 font-syne">{turno.label}</span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {turno.slots.map((time) => {
                      const occupied = isRescheduleSlotOccupied(time);
                      const isSelected = rescheduleTimeSlot === time;

                      return (
                        <button
                          key={time}
                          type="button"
                          disabled={occupied}
                          onClick={() => setRescheduleTimeSlot(time)}
                          className={`flex items-center justify-center gap-1 rounded-lg border py-2 text-xs font-bold transition-all ${
                            occupied
                              ? 'cursor-not-allowed border-zinc-900 bg-zinc-900/40 text-zinc-600 line-through'
                              : isSelected
                              ? 'border-blue-400 bg-blue-400 text-black font-extrabold shadow-md'
                              : 'border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-blue-400/50 hover:text-blue-400'
                          }`}
                        >
                          <Clock className="h-3 w-3 shrink-0" />
                          <span>{time}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-blue-400 shrink-0" />
                <span>Horários riscados já passaram ou estão indisponíveis.</span>
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setReschedulingApt(null)}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!rescheduleDate || !rescheduleTimeSlot || !rescheduleBarberId}
                onClick={handleSaveReschedule}
                className="rounded-xl bg-blue-500 px-5 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-blue-600 shadow-md disabled:opacity-40"
              >
                Confirmar Reagendamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
