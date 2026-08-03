import React from 'react';
import { CalendarCheck2, Clock, User, Scissors, XCircle, ChevronLeft } from 'lucide-react';
import { Appointment, UserAccount } from '../types';

interface ClientAppointmentsProps {
  currentUser: UserAccount;
  appointments: Appointment[];
  onCancelAppointment: (id: string) => void;
  onBackToHome: () => void;
}

export const ClientAppointments: React.FC<ClientAppointmentsProps> = ({
  currentUser,
  appointments,
  onCancelAppointment,
  onBackToHome,
}) => {
  // Filter appointments for current client
  const myBookings = appointments.filter((apt) => apt.clientId === currentUser.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <button
            onClick={onBackToHome}
            className="mb-2 flex items-center gap-1 text-xs font-bold text-yellow-400 hover:text-yellow-300 uppercase tracking-widest"
          >
            <ChevronLeft className="h-4 w-4" /> Voltar ao Início
          </button>
          <h2 className="font-syne text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">Meus Agendamentos</h2>
          <p className="text-xs text-gray-400">
            Acompanhe seus horários agendados em tempo real na Barbearia Jadson Barber.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0F0F0F] p-3 text-right">
          <span className="text-[10px] text-gray-500 block font-bold uppercase tracking-widest">Total</span>
          <span className="font-syne text-xl font-black text-yellow-400">{myBookings.length}</span>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="rounded-2xl border border-yellow-500/20 bg-gradient-to-r from-zinc-900 to-zinc-950 p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-bold text-lg">
            <User className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-syne text-lg font-bold text-white">{currentUser.name}</h3>
              {currentUser.email?.includes('gmail.com') && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-yellow-400 border border-yellow-500/20">
                  Google
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">{currentUser.email || 'Conta cadastrada'}</p>
            {currentUser.phone && (
              <p className="text-[11px] text-gray-500">{currentUser.phone}</p>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-400 bg-white/5 rounded-xl px-3 py-2 border border-white/5">
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
            Use nosso Quiz Interativo para escolher seu corte, barbeiro e horário ideal.
          </p>
          <button
            onClick={onBackToHome}
            className="rounded-xl bg-gold-gradient px-6 py-2.5 text-xs font-extrabold text-zinc-950 shadow-md shadow-amber-500/20"
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
                  <span className="text-zinc-500 text-[10px] block">Serviço</span>
                  <strong className="text-white text-sm">{apt.serviceName}</strong>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-zinc-500 text-[10px] block">Barbeiro</span>
                    <strong className="text-amber-400">{apt.barberName}</strong>
                  </div>

                  <div>
                    <span className="text-zinc-500 text-[10px] block">Data & Horário</span>
                    <strong className="text-white">{apt.date} às {apt.timeSlot}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3">
                <div>
                  <span className="text-[10px] text-zinc-500 block">Valor</span>
                  <span className="font-syne text-lg font-bold text-gold-gradient">
                    R$ {apt.servicePrice.toFixed(2)}
                  </span>
                </div>

                {apt.status !== 'cancelado' && (
                  <button
                    onClick={() => {
                      if (confirm('Deseja realmente cancelar este agendamento?')) {
                        onCancelAppointment(apt.id);
                      }
                    }}
                    className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Cancelar</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
