import React from 'react';
import { Scissors, Clock, Star, Coffee, Shield, ChevronRight, Award, CheckCircle2 } from 'lucide-react';
import { Service, Barber } from '../types';

interface HeroReceptionProps {
  onStartQuiz: () => void;
  services: Service[];
  barbers: Barber[];
  onSelectServiceQuiz?: (serviceId: string) => void;
}

export const HeroReception: React.FC<HeroReceptionProps> = ({
  onStartQuiz,
  services,
  barbers,
  onSelectServiceQuiz,
}) => {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Header / Reception Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0F0F0F] p-6 sm:p-10 lg:p-14 shadow-2xl">
        {/* Subtle gold glow background gradients */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-yellow-500/10 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-orange-600/5 blur-[80px]" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1.5 text-xs font-bold text-yellow-400 uppercase tracking-widest backdrop-blur-md">
            <span>Premium Experience</span>
          </div>

          <h1 className="font-syne text-5xl font-black uppercase leading-[0.95] text-white sm:text-6xl lg:text-7xl">
            O ESTILO QUE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">VOCÊ MERECE.</span>
          </h1>

          <p className="text-base text-gray-400 sm:text-lg leading-relaxed max-w-xl">
            Agende seu horário com o mestre Jadson. Cortes clássicos, degradês modernos, visagismo e barba com toalha quente em ambiente exclusivo.
          </p>

          {/* Primary CTA Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
            <button
              onClick={onStartQuiz}
              className="px-10 py-5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-black font-black uppercase text-xl tracking-tighter hover:scale-105 active:scale-95 transition-transform rounded-sm shadow-[0_0_40px_rgba(234,179,8,0.2)] flex items-center justify-center gap-3"
            >
              <Scissors className="h-6 w-6 text-black" />
              <span>Agendar Agora</span>
              <ChevronRight className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-2 px-2 text-xs text-gray-400 uppercase font-semibold tracking-wider">
              <Clock className="h-4 w-4 text-yellow-400" />
              <span>Reserva simples & rápida</span>
            </div>
          </div>

          {/* Highlights Pills */}
          <div className="grid grid-cols-2 gap-3 pt-6 border-t border-white/5 sm:grid-cols-4">
            <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
              <Scissors className="h-4 w-4 text-yellow-400 shrink-0" />
              <span>Atendimento Exclusivo</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
              <Award className="h-4 w-4 text-yellow-400 shrink-0" />
              <span>Visagismo Slim Custom</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
              <Shield className="h-4 w-4 text-yellow-400 shrink-0" />
              <span>Toalha Quente & Vapor</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
              <CheckCircle2 className="h-4 w-4 text-yellow-400 shrink-0" />
              <span>Pontualidade VIP</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Menu Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-bold text-yellow-500 uppercase tracking-[0.3em]">Menu de Serviços</p>
            <h2 className="font-syne text-2xl font-black uppercase text-white sm:text-3xl">Cortes & Tratamentos Exclusivos</h2>
          </div>
          <button
            onClick={onStartQuiz}
            className="text-xs font-bold text-yellow-400 hover:text-yellow-300 uppercase tracking-widest flex items-center gap-1"
          >
            Ver no Quiz <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0F0F0F] p-5 transition-all duration-200 hover:border-yellow-500/50 hover:bg-black/40 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)]"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] font-bold text-gray-300">
                    {service.durationMinutes} min
                  </span>
                  {service.popular && (
                    <span className="flex items-center gap-1 rounded-full bg-yellow-500/20 border border-yellow-500/40 px-2.5 py-0.5 text-[10px] font-extrabold text-yellow-300 uppercase tracking-wider">
                      MAIS PEDIDO
                    </span>
                  )}
                </div>

                <h3 className="mt-3 font-syne text-lg font-bold text-white group-hover:text-yellow-400 transition-colors uppercase tracking-tight">
                  {service.name}
                </h3>
                <p className="mt-1.5 text-xs text-gray-400 font-light line-clamp-2 leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 block font-bold">Investimento</span>
                  <span className="font-syne text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                    R$ {service.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (onSelectServiceQuiz) onSelectServiceQuiz(service.id);
                    else onStartQuiz();
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-bold text-yellow-400 uppercase tracking-wider transition-all hover:bg-yellow-400 hover:text-black"
                >
                  <span>Selecionar</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Barbers Team Showcase */}
      <section className="space-y-6">
        <div className="border-b border-white/10 pb-4">
          <p className="text-xs font-bold text-yellow-500 uppercase tracking-[0.3em]">Equipe Jadson Barber</p>
          <h2 className="font-syne text-2xl font-black uppercase text-white sm:text-3xl">Barbeiros Especialistas</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {barbers.map((barber) => (
            <div
              key={barber.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F0F0F] transition-all hover:border-yellow-500/40"
            >
              <div className="relative h-48 w-full overflow-hidden bg-black">
                <img
                  src={barber.avatar}
                  alt={barber.name}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="flex items-center gap-1 rounded-md bg-black/80 backdrop-blur-md px-2 py-1 text-xs font-bold text-yellow-400 border border-yellow-500/30">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="ml-0.5">{barber.rating.toFixed(1)}</span>
                  </span>
                  <span className="rounded-md bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300 uppercase tracking-widest">
                    DISPONÍVEL HOJE
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div>
                  <h3 className="font-syne text-lg font-bold text-white uppercase tracking-tight">{barber.name}</h3>
                  <p className="text-xs font-bold text-yellow-500 uppercase tracking-wider">{barber.role}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {barber.specialties.map((spec, idx) => (
                    <span
                      key={idx}
                      className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-gray-300 border border-white/5 uppercase tracking-wider font-semibold"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                <button
                  onClick={onStartQuiz}
                  className="w-full mt-2 rounded-lg bg-white/10 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-yellow-400 hover:text-black"
                >
                  Agendar com {barber.name.split(' ')[0]}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Quiz Callout Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-yellow-500/30 bg-[#0F0F0F] p-8 text-center sm:p-12 shadow-[0_0_50px_rgba(234,179,8,0.1)]">
        <div className="mx-auto max-w-xl space-y-5">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-orange-600 text-black font-bold shadow-[0_0_20px_rgba(234,179,8,0.3)]">
            <Scissors className="h-6 w-6" />
          </div>
          <h2 className="font-syne text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
            Pronto para renovar seu visual?
          </h2>
          <p className="text-xs text-gray-400 sm:text-sm leading-relaxed">
            Inicie nosso Agendamento Slim em 4 etapas simples: escolha data e horário, barbeiro, serviços e confirme seu resumo.
          </p>
          <button
            onClick={onStartQuiz}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-black font-black uppercase text-base tracking-tighter hover:scale-105 active:scale-95 transition-transform rounded-sm shadow-[0_0_30px_rgba(234,179,8,0.2)]"
          >
            <span>Iniciar Agendamento Agora</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
};
