import React, { useState } from 'react';
import { 
  Scissors, UserCheck, Calendar as CalendarIcon, Clock, Star, Sparkles,
  ChevronRight, ChevronLeft, Check, AlertCircle, CheckCircle2, ShieldCheck, Plus, Trash2
} from 'lucide-react';
import { Service, Barber, UserAccount, Appointment, BlockedSlot } from '../types';
import { GENERATE_TIME_SLOTS } from '../services/store';
import { isBarberInLunchBreak } from '../utils/lunchBreak';

interface BookingQuizProps {
  services: Service[];
  barbers: Barber[];
  appointments: Appointment[];
  blockedSlots: BlockedSlot[];
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
  onConfirmBooking: (bookingData: Omit<Appointment, 'id' | 'createdAt'>) => void;
  initialServiceId?: string | null;
  onCancel: () => void;
}

export const BookingQuiz: React.FC<BookingQuizProps> = ({
  services,
  barbers,
  appointments,
  blockedSlots,
  currentUser,
  onOpenAuth,
  onConfirmBooking,
  initialServiceId,
  onCancel,
}) => {
  // Step 1: Data e Horário
  // Step 2: Barbeiro
  // Step 3: Serviços (Múltiplos)
  // Step 4: Resumo e Confirmação
  const [step, setStep] = useState<number>(1);

  // Element Refs for Auto-Scrolling
  const quizTopRef = React.useRef<HTMLDivElement>(null);
  const nextButtonStep1Ref = React.useRef<HTMLDivElement>(null);
  const nextButtonStep2Ref = React.useRef<HTMLDivElement>(null);
  const nextButtonStep3Ref = React.useRef<HTMLDivElement>(null);

  const scrollToElement = (ref: React.RefObject<HTMLDivElement>, block: ScrollLogicalPosition = 'nearest') => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block });
    }, 100);
  };

  const goToStep = (newStep: number) => {
    setStep(newStep);
    setTimeout(() => {
      quizTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Date selection (default today YYYY-MM-DD)
  const todayDate = new Date();
  const formatDateISO = (d: Date) => d.toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(formatDateISO(todayDate));

  // Time slot selection
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  // Barber selection
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(barbers[0] || null);

  // Multiple Service selection IDs
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(() => {
    if (initialServiceId && services.some(s => s.id === initialServiceId)) {
      return [initialServiceId];
    }
    return services[0] ? [services[0].id] : [];
  });

  // Notes
  const [notes, setNotes] = useState<string>('');

  // Category filter for services
  const [categoryFilter, setCategoryFilter] = useState<'todos' | 'corte' | 'barba' | 'combo' | 'especial'>('todos');

  // Success state
  const [completedAppointment, setCompletedAppointment] = useState<Appointment | null>(null);

  // Generate date options (Today + next 7 days)
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

  // Calculate occupied time slots for chosen date and barber
  const allTimeSlots = GENERATE_TIME_SLOTS();

  const isPastTimeSlot = (dateIso: string, timeSlot: string) => {
    const now = new Date();
    const todayIso = formatDateISO(now);

    if (dateIso < todayIso) return true; // past date
    if (dateIso > todayIso) return false; // future date

    // Same day: check hour and minute
    const [slotHour, slotMin] = timeSlot.split(':').map(Number);
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    if (slotHour < currentHour) return true;
    if (slotHour === currentHour && slotMin <= currentMin) return true;
    return false;
  };

  const isSlotOccupied = (timeSlot: string) => {
    const isPast = isPastTimeSlot(selectedDate, timeSlot);

    const hasBooking = appointments.some(
      (apt) =>
        apt.date === selectedDate &&
        apt.timeSlot === timeSlot &&
        (apt.barberId === selectedBarber?.id || selectedBarber?.id === 'any') &&
        apt.status !== 'cancelado'
    );

    const isBlocked = blockedSlots.some(
      (blk) =>
        blk.date === selectedDate &&
        blk.timeSlot === timeSlot &&
        (!blk.barberId || blk.barberId === selectedBarber?.id)
    );

    const inLunchBreak = selectedBarber
      ? isBarberInLunchBreak(timeSlot, selectedBarber.lunchBreak, selectedBarber.lunchStart, selectedBarber.lunchEnd)
      : barbers.length > 0 && barbers.every((b) => isBarberInLunchBreak(timeSlot, b.lunchBreak, b.lunchStart, b.lunchEnd));

    return isPast || hasBooking || isBlocked || inLunchBreak;
  };

  // Turnos grouping
  const timeSlotTurnos = [
    {
      id: 'manha',
      label: 'Manhã',
      icon: '☀️',
      slots: allTimeSlots.filter((t) => parseInt(t.split(':')[0], 10) < 12),
    },
    {
      id: 'tarde',
      label: 'Tarde',
      icon: '🌤️',
      slots: allTimeSlots.filter((t) => {
        const h = parseInt(t.split(':')[0], 10);
        return h >= 12 && h < 18;
      }),
    },
    {
      id: 'noite',
      label: 'Noite',
      icon: '🌙',
      slots: allTimeSlots.filter((t) => parseInt(t.split(':')[0], 10) >= 18),
    },
  ].filter((turno) => turno.slots.length > 0);

  // Service toggle helper
  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) => {
      if (prev.includes(serviceId)) {
        if (prev.length === 1) return prev; // Keep at least one selected
        return prev.filter((id) => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  // Get selected services objects
  const selectedServices = services.filter((s) => selectedServiceIds.includes(s.id));
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
  const combinedServiceNames = selectedServices.map((s) => s.name).join(' + ');

  // Filter services by category for step 3
  const filteredServices = services.filter((s) => {
    if (categoryFilter === 'todos') return true;
    return s.category === categoryFilter;
  });

  // Handle final submission
  const handleFinalSubmit = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!selectedDate || !selectedTimeSlot || !selectedBarber || selectedServices.length === 0) {
      alert('Por favor, selecione data, horário, barbeiro e pelo menos 1 serviço.');
      return;
    }

    const newAppointmentData = {
      clientId: currentUser.id,
      clientName: currentUser.name,
      clientEmail: currentUser.email,
      clientPhone: currentUser.phone || '(11) 99999-9999',
      serviceId: selectedServices[0].id,
      serviceIds: selectedServiceIds,
      serviceName: combinedServiceNames,
      servicePrice: totalPrice,
      serviceDuration: totalDuration,
      barberId: selectedBarber.id,
      barberName: selectedBarber.name,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      notes: notes,
      status: 'confirmado' as const,
    };

    onConfirmBooking(newAppointmentData);

    setCompletedAppointment({
      ...newAppointmentData,
      id: 'apt-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    });
  };

  // If completed, show confirmation ticket
  if (completedAppointment) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-emerald-500/30 bg-[#0F0F0F] p-6 sm:p-10 shadow-2xl backdrop-blur-md">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="font-syne text-3xl font-black uppercase tracking-tight text-white">Agendamento Confirmado!</h2>
          <p className="text-xs text-gray-400">
            Seu agendamento foi registrado com sucesso. Nos vemos na barbearia!
          </p>
        </div>

        {/* Ticket Summary */}
        <div className="rounded-xl border border-white/10 bg-black/60 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-yellow-400 uppercase tracking-wider">
              <Scissors className="h-4 w-4" /> Jadson Barber Slim
            </div>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-0.5 text-xs font-bold text-emerald-400 uppercase tracking-widest">
              {completedAppointment.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">Cliente</span>
              <strong className="text-white text-sm">{completedAppointment.clientName}</strong>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">Barbeiro</span>
              <strong className="text-yellow-400 text-sm">{completedAppointment.barberName}</strong>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">Data & Horário</span>
              <strong className="text-white text-sm">{completedAppointment.date} às {completedAppointment.timeSlot}</strong>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">Duração Estimada</span>
              <strong className="text-gray-300 text-sm">{completedAppointment.serviceDuration} min</strong>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">Serviços Selecionados</span>
              <strong className="text-white text-sm">{completedAppointment.serviceName}</strong>
            </div>
            <div className="col-span-2 border-t border-white/10 pt-3 flex items-center justify-between">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Valor Total</span>
              <strong className="font-syne text-xl text-yellow-400 font-black">
                R$ {completedAppointment.servicePrice.toFixed(2).replace('.', ',')}
              </strong>
            </div>
          </div>

          {completedAppointment.notes && (
            <div className="border-t border-white/10 pt-3 text-xs text-gray-400">
              <strong className="text-gray-300">Observação:</strong> {completedAppointment.notes}
            </div>
          )}
        </div>

        <div className="flex justify-center pt-2">
          <button
            onClick={onCancel}
            className="rounded-lg bg-yellow-400 px-8 py-3.5 text-xs font-extrabold uppercase tracking-widest text-black shadow-lg hover:bg-yellow-300 transition-colors"
          >
            VOLTAR AO INÍCIO
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={quizTopRef} className="mx-auto max-w-3xl space-y-6">
      
      {/* Quiz Progress Header */}
      <div className="rounded-2xl border border-white/10 bg-[#0F0F0F] p-5 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-syne text-xl font-bold uppercase tracking-tight text-white sm:text-2xl">
              {
                step === 1 ? 'Data e Horário' :
                step === 2 ? 'Barbeiro' :
                step === 3 ? 'Escolha os Serviços' : 'Resumo e Confirmação'
              }
            </h2>
          </div>

          <button
            onClick={onCancel}
            className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white"
          >
            Cancelar
          </button>
        </div>

        {/* Progress Bar */}
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Steps indicator chips */}
        <div className="grid grid-cols-4 text-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
          <span className={step >= 1 ? 'text-yellow-400 font-extrabold' : ''}>Data & Hora</span>
          <span className={step >= 2 ? 'text-yellow-400 font-extrabold' : ''}>Barbeiro</span>
          <span className={step >= 3 ? 'text-yellow-400 font-extrabold' : ''}>Serviços</span>
          <span className={step >= 4 ? 'text-yellow-400 font-extrabold' : ''}>Resumo</span>
        </div>
      </div>

      {/* QUIZ STEP 1: DATA E HORÁRIO */}
      {step === 1 && (
        <div className="space-y-6 rounded-2xl border border-white/10 bg-[#0F0F0F] p-6 backdrop-blur-md">
          {/* Date Picker Ribbon */}
          <div>
            <label className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest block mb-3">
              Selecione a Data
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {availableDates.map((item) => {
                const isSelected = selectedDate === item.iso;
                return (
                  <button
                    key={item.iso}
                    onClick={() => {
                      setSelectedDate(item.iso);
                      setSelectedTimeSlot(''); // Reset slot on date change
                      scrollToElement(nextButtonStep1Ref, 'nearest');
                    }}
                    className={`flex min-w-[75px] flex-col items-center rounded-xl border p-3 transition-all ${
                      isSelected
                        ? 'border-yellow-400 bg-yellow-400 text-black font-extrabold shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-wider">
                      {item.isToday ? 'Hoje' : item.dayName}
                    </span>
                    <span className="font-syne text-lg font-black">{item.dayNum}</span>
                    <span className="text-[9px] uppercase font-semibold">{item.monthName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slot Grid Grouped by Turnos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest block">
                Selecione o Horário Disponível ({selectedDate})
              </label>
            </div>

            {timeSlotTurnos.map((turno) => (
              <div key={turno.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                  <span>{turno.icon}</span>
                  <span className="text-yellow-400 font-syne">{turno.label}</span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {turno.slots.map((time) => {
                    const occupied = isSlotOccupied(time);
                    const isSelected = selectedTimeSlot === time;

                    return (
                      <button
                        key={time}
                        disabled={occupied}
                        onClick={() => {
                          setSelectedTimeSlot(time);
                          scrollToElement(nextButtonStep1Ref, 'nearest');
                        }}
                        className={`flex items-center justify-center gap-1.5 rounded-lg border py-2.5 text-xs font-bold transition-all ${
                          occupied
                            ? 'cursor-not-allowed border-white/5 bg-white/[0.02] text-gray-600 line-through'
                            : isSelected
                            ? 'border-yellow-400 bg-yellow-400 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)] font-extrabold scale-105'
                            : 'border-white/10 bg-white/5 text-gray-200 hover:border-yellow-400/50 hover:text-yellow-400'
                        }`}
                      >
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>{time}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <p className="mt-4 text-[11px] text-gray-400 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
              <span>Horários <span className="line-through text-gray-600">riscados</span> já possuem agendamento, passaram ou estão bloqueados.</span>
            </p>
          </div>

          <div ref={nextButtonStep1Ref} className="flex justify-end pt-4 border-t border-white/10">
            <button
              disabled={!selectedDate || !selectedTimeSlot}
              onClick={() => goToStep(2)}
              className="flex items-center gap-1.5 rounded-lg bg-yellow-400 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black shadow-md hover:bg-yellow-300 disabled:opacity-40 transition-all"
            >
              <span>Próximo</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* QUIZ STEP 2: BARBEIRO */}
      {step === 2 && (
        <div className="space-y-6 rounded-2xl border border-white/10 bg-[#0F0F0F] p-6 backdrop-blur-md">
          <p className="text-xs text-gray-300">
            Escolha o barbeiro de sua preferência para o atendimento no dia <strong className="text-white">{selectedDate}</strong> às <strong className="text-yellow-400">{selectedTimeSlot}</strong>.
          </p>

          <div className="grid grid-cols-1 gap-4">
            {barbers.map((barber) => {
              const isSelected = selectedBarber?.id === barber.id;
              const isLunch = isBarberInLunchBreak(
                selectedTimeSlot,
                barber.lunchBreak,
                barber.lunchStart,
                barber.lunchEnd
              );
              const isInactive = barber.status === 'inactive' || barber.status === 'away';
              const isUnavailable = isLunch || isInactive;

              return (
                <div
                  key={barber.id}
                  onClick={() => {
                    if (isLunch) {
                      alert(`O barbeiro ${barber.name} está indisponível às ${selectedTimeSlot} (Horário de almoço: ${barber.lunchBreak || '12:00 - 13:00'}).`);
                      return;
                    }
                    if (isInactive) {
                      alert(`O barbeiro ${barber.name} está indisponível na agenda.`);
                      return;
                    }
                    setSelectedBarber(barber);
                    scrollToElement(nextButtonStep2Ref, 'nearest');
                  }}
                  className={`relative overflow-hidden rounded-2xl border p-3 sm:p-4 transition-all flex flex-row items-start gap-3 sm:gap-4 ${
                    isUnavailable
                      ? 'cursor-not-allowed border-red-500/30 bg-red-950/10 opacity-75 hover:opacity-90'
                      : isSelected
                      ? 'cursor-pointer border-yellow-400/80 bg-yellow-500/10 shadow-[0_0_20px_rgba(234,179,8,0.15)]'
                      : 'cursor-pointer border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  {/* Foto Menor no lado esquerdo (1:1 Quadrada 500x500 base) */}
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 overflow-hidden rounded-xl bg-zinc-900 border border-white/10 shadow-md">
                    <img
                      src={barber.avatar}
                      alt={barber.name}
                      width={500}
                      height={500}
                      className={`h-full w-full object-cover ${isUnavailable ? 'grayscale' : ''}`}
                    />
                    {isLunch && (
                      <div className="absolute top-1 left-1 right-1 bg-red-600/90 text-white text-[9px] font-black uppercase tracking-tight py-0.5 px-1 rounded text-center backdrop-blur-sm border border-red-400/30 shadow-lg">
                        Almoço
                      </div>
                    )}
                    {isInactive && !isLunch && (
                      <div className="absolute top-1 left-1 right-1 bg-zinc-800/90 text-zinc-300 text-[9px] font-black uppercase tracking-tight py-0.5 px-1 rounded text-center backdrop-blur-sm border border-zinc-600">
                        Indisponível
                      </div>
                    )}
                    {isSelected && !isUnavailable && (
                      <div className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-black font-bold shadow-lg">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Descrições e Tags ao LADO DIREITO alinhados à imagem */}
                  <div className="flex-1 min-w-0 space-y-2 flex flex-col justify-between text-left">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-white/10 pb-1.5">
                        <div className="min-w-0">
                          <h3 className="font-syne text-base font-bold text-white uppercase tracking-tight truncate">{barber.name}</h3>
                          <p className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider">{barber.role}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-400/10 border border-yellow-400/30 px-2 py-0.5 rounded-full shrink-0">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-extrabold text-yellow-400">{barber.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Tags / Especialidades */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                          Especialidades:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {barber.specialties.map((spec, i) => (
                            <span key={i} className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold text-gray-200 border border-white/10">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>

                      {isLunch && (
                        <div className="text-[11px] font-bold text-red-400 flex items-center gap-1 bg-red-500/10 p-1.5 rounded-lg border border-red-500/20">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          <span>Almoço ({barber.lunchBreak || '12:00 - 13:00'})</span>
                        </div>
                      )}
                    </div>

                    {/* Botão de escolha alinhado no rodapé do cartão */}
                    <div className="pt-1 flex items-center justify-between gap-2 border-t border-white/5">
                      <span className="text-[10px] text-gray-400 font-semibold truncate hidden sm:inline">
                        {isSelected ? '✓ Selecionado' : 'Clique para selecionar'}
                      </span>
                      <button
                        type="button"
                        className={`w-full sm:w-auto px-3 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider transition-all ${
                          isSelected
                            ? 'bg-yellow-400 text-black shadow-md scale-102'
                            : 'bg-white/10 text-white hover:bg-yellow-400 hover:text-black'
                        }`}
                      >
                        {isSelected ? 'Selecionado' : 'Escolher'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div ref={nextButtonStep2Ref} className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              onClick={() => goToStep(1)}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-300 hover:bg-white/10"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Voltar
            </button>

            <button
              disabled={
                !selectedBarber ||
                selectedBarber.status === 'inactive' ||
                selectedBarber.status === 'away' ||
                isBarberInLunchBreak(selectedTimeSlot, selectedBarber.lunchBreak, selectedBarber.lunchStart, selectedBarber.lunchEnd)
              }
              onClick={() => goToStep(3)}
              className="flex items-center gap-1.5 rounded-lg bg-yellow-400 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black shadow-md hover:bg-yellow-300 disabled:opacity-40 transition-all"
            >
              <span>Próximo</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* QUIZ STEP 3: SERVIÇOS (MÚLTIPLA SELEÇÃO) */}
      {step === 3 && (
        <div className="space-y-6 rounded-2xl border border-white/10 bg-[#0F0F0F] p-6 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="font-syne text-base font-bold uppercase tracking-tight text-white">
                Escolha 1 ou mais serviços
              </h3>
              <p className="text-xs text-gray-400">
                Você pode combinar vários serviços para um mesmo atendimento.
              </p>
            </div>
            
            {/* Selected Count Tag */}
            <div className="rounded-lg bg-yellow-400/10 border border-yellow-400/30 px-3 py-1 text-xs font-bold text-yellow-400 uppercase tracking-widest">
              {selectedServiceIds.length} {selectedServiceIds.length === 1 ? 'Serviço' : 'Serviços'}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {(['todos', 'corte', 'barba', 'combo', 'especial'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-md px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                  categoryFilter === cat
                    ? 'bg-yellow-400 text-black shadow-md'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Service Grid with Checkboxes for Multi-Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredServices.map((service) => {
              const isSelected = selectedServiceIds.includes(service.id);
              return (
                <div
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                    isSelected
                      ? 'border-yellow-400 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.15)]'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-syne text-sm font-bold text-white">{service.name}</h3>
                        {service.popular && (
                          <span className="rounded bg-yellow-400/20 text-yellow-300 text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-400 line-clamp-2">{service.description}</p>
                    </div>

                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-all ${
                        isSelected
                          ? 'border-yellow-400 bg-yellow-400 text-black font-bold'
                          : 'border-white/20 bg-white/5'
                      }`}
                    >
                      {isSelected && <Check className="h-4 w-4 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2.5">
                    <span className="text-[11px] text-gray-400 font-medium">{service.durationMinutes} min</span>
                    <span className="font-syne text-sm font-bold text-yellow-400">
                      R$ {service.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dynamic Floating Selected Services Total */}
          <div className="rounded-xl border border-yellow-500/20 bg-gradient-to-r from-zinc-900 via-[#0D0D0D] to-black p-4 shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              {/* Service name & item count */}
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-400"></span>
                  Total Acumulado ({selectedServices.length} {selectedServices.length === 1 ? 'item' : 'itens'})
                </span>
                <p className="text-xs text-white font-bold truncate">
                  {combinedServiceNames || 'Nenhum serviço'}
                </p>
              </div>

              {/* Total Duration */}
              <div className="sm:text-center border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:px-4">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block">Duração Total</span>
                <span className="text-xs text-white font-bold flex items-center sm:justify-center gap-1 mt-0.5">
                  <Clock className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
                  {totalDuration} min
                </span>
              </div>

              {/* Total Price */}
              <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-4">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block">Valor Total</span>
                <span className="font-syne text-lg font-black text-yellow-400 block mt-0.5">
                  R$ {totalPrice.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          </div>

          <div ref={nextButtonStep3Ref} className="flex items-center justify-between pt-2 border-t border-white/10">
            <button
              onClick={() => goToStep(2)}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-300 hover:bg-white/10"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Voltar
            </button>

            <button
              disabled={selectedServiceIds.length === 0}
              onClick={() => goToStep(4)}
              className="flex items-center gap-1.5 rounded-lg bg-yellow-400 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black shadow-md hover:bg-yellow-300 disabled:opacity-40 transition-all"
            >
              <span>Próximo</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* QUIZ STEP 4: RESUMO & CONFIRMAÇÃO */}
      {step === 4 && (
        <div className="space-y-6 rounded-2xl border border-white/10 bg-[#0F0F0F] p-6 sm:p-8 backdrop-blur-md">
          <div className="border-b border-white/10 pb-4">
            <h3 className="font-syne text-xl font-bold uppercase tracking-tight text-white">Resumo do Agendamento</h3>
            <p className="text-xs text-gray-400">Verifique todas as informações antes de confirmar.</p>
          </div>

          {/* Summary Card Grid */}
          <div className="rounded-xl border border-white/10 bg-black/60 p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-gray-500 uppercase text-[10px] font-bold tracking-widest block">Data & Horário</span>
                <strong className="text-white text-sm block mt-0.5">{selectedDate} às {selectedTimeSlot}</strong>
              </div>

              <div>
                <span className="text-gray-500 uppercase text-[10px] font-bold tracking-widest block">Barbeiro</span>
                <strong className="text-yellow-400 text-sm block mt-0.5">{selectedBarber?.name}</strong>
                <p className="text-gray-400 text-[11px]">{selectedBarber?.role}</p>
              </div>

              <div>
                <span className="text-gray-500 uppercase text-[10px] font-bold tracking-widest block">Duração Total</span>
                <strong className="text-white text-sm block mt-0.5">{totalDuration} minutos</strong>
              </div>
            </div>

            <div className="border-t border-white/10 pt-3 space-y-2">
              <span className="text-gray-500 uppercase text-[10px] font-bold tracking-widest block">Serviços Selecionados</span>
              <div className="space-y-1.5">
                {selectedServices.map((srv) => (
                  <div key={srv.id} className="flex items-center justify-between text-xs bg-white/5 rounded-lg p-2.5">
                    <span className="text-white font-medium">{srv.name} ({srv.durationMinutes} min)</span>
                    <span className="text-yellow-400 font-bold">R$ {srv.price.toFixed(2).replace('.', ',')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 pt-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                Observações ou Pedidos Especiais (Opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: 'Prefiro degradê navalhado', 'Corte rápido para compromisso'."
                rows={2}
                className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white placeholder-gray-600 focus:border-yellow-500/50 focus:outline-none transition-colors"
              />
            </div>

            {currentUser && (
              <div className="border-t border-white/10 pt-3">
                <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest block">
                      Cliente Cadastrado
                    </span>
                    <p className="text-sm font-bold text-white mt-0.5">{currentUser.name}</p>
                    <p className="text-xs text-gray-300">{currentUser.email}</p>
                  </div>
                  <span className="text-[10px] bg-yellow-400 text-black px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wider">
                    Google / Conta Ativa
                  </span>
                </div>
              </div>
            )}

            <div className="border-t border-white/10 pt-4 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Valor Total a Pagar:</span>
              <span className="font-syne text-2xl font-black text-yellow-400">
                R$ {totalPrice.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          {/* AUTHENTICATION GATE WARNING / BUTTON */}
          {!currentUser ? (
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-5 text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-yellow-400 font-bold text-xs uppercase tracking-wider">
                <AlertCircle className="h-4 w-4" />
                <span>Identificação Necessária</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed max-w-lg mx-auto">
                Para confirmar seu agendamento e salvar seu horário em tempo real, faça login ou crie seu cadastro rápido.
              </p>
              
              <div className="pt-2 flex justify-center">
                <button
                  onClick={onOpenAuth}
                  className="btn-golden-glow animate-gold-flow flex items-center justify-center gap-2.5 rounded-xl px-8 py-4 text-xs font-black uppercase tracking-widest text-black shadow-2xl cursor-pointer border border-yellow-200/40"
                >
                  <UserCheck className="h-4 w-4 text-black stroke-[2.5]" />
                  <span>ENTRAR / CADASTRAR PARA FINALIZAR</span>
                  <Sparkles className="h-4 w-4 text-black/80" />
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <ShieldCheck className="h-4 w-4" />
                <span>Logado como {currentUser.name} ({currentUser.email})</span>
              </div>

              <button
                onClick={handleFinalSubmit}
                className="btn-golden-glow animate-gold-flow w-full flex items-center justify-center gap-2.5 rounded-2xl py-4.5 px-6 text-xs sm:text-sm font-black uppercase tracking-widest text-black shadow-2xl cursor-pointer border border-yellow-200/50"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black/10 border border-black/20">
                  <CheckCircle2 className="h-4 w-4 text-black stroke-[3]" />
                </div>
                <span>CONFIRMAR AGENDAMENTO EM TEMPO REAL</span>
                <Sparkles className="h-4 w-4 text-black/80 shrink-0" />
              </button>
            </div>
          )}

          <div className="flex justify-start">
            <button
              onClick={() => goToStep(3)}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" /> Voltar para Serviços
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
