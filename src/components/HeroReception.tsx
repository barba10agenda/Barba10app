import React from 'react';
import { Scissors, Clock, Star, Shield, ChevronRight, Award, CheckCircle2 } from 'lucide-react';
import { Service, Barber } from '../types';
import { ShopConfig } from '../services/configuracoes';

interface HeroReceptionProps {
  onStartQuiz: () => void;
  services: Service[];
  barbers: Barber[];
  onSelectServiceQuiz?: (serviceId: string) => void;
  shopConfig?: ShopConfig;
}

export const HeroReception: React.FC<HeroReceptionProps> = ({
  onStartQuiz,
  services,
  barbers,
  onSelectServiceQuiz,
  shopConfig,
}) => {
  const badge = shopConfig?.heroBadge || 'Premium Experience';
  const titleLine1 = shopConfig?.heroTitleLine1 || 'O ESTILO QUE';
  const titleLine2 = shopConfig?.heroTitleLine2 || 'VOCÊ MERECE.';
  const description = shopConfig?.heroDescription || 'Agende seu horário com o mestre Jadson. Cortes clássicos, degradês modernos, visagismo e barba com toalha quente em ambiente exclusivo.';
  const ctaText = shopConfig?.ctaButtonText || 'Agendar Agora';
  const pill1 = shopConfig?.highlightsPill1 || 'Atendimento Exclusivo';
  const pill2 = shopConfig?.highlightsPill2 || 'Visagismo Slim Custom';
  const pill3 = shopConfig?.highlightsPill3 || 'Toalha Quente & Vapor';
  const pill4 = shopConfig?.highlightsPill4 || 'Pontualidade VIP';
  const ctaSubtext = shopConfig?.ctaSubtext || 'Reserva simples & rápida';
  const bannerBtnText = shopConfig?.bannerButtonText || 'Iniciar Agendamento Agora';
  const servicesTitle = 'Cortes & Tratamentos Exclusivos';
  const servicesSubtitle = 'Menu de Serviços';
  const teamTitle = shopConfig?.teamSectionTitle || 'Barbeiros Especialistas';
  const teamSubtitle = shopConfig?.teamSectionSubtitle || 'Equipe Jadson Barber';
  const bannerTitle = shopConfig?.bannerTitle || 'Pronto para renovar seu visual?';
  const bannerDesc = shopConfig?.bannerDescription || 'Inicie nosso Agendamento Slim em 4 etapas simples: escolha data e horário, barbeiro, serviços e confirme seu resumo.';

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Header / Reception Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0F0F0F] p-6 sm:p-10 lg:p-14 shadow-2xl">
        {/* Subtle gold glow background gradients */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-yellow-500/10 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-yellow-500/5 blur-[80px]" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1.5 text-xs font-bold text-yellow-400 uppercase tracking-widest backdrop-blur-md">
            <span>{badge}</span>
          </div>

          <h1 className="font-syne text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-[1.05] sm:leading-[0.95] text-white break-words">
            {titleLine1} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500">{titleLine2}</span>
          </h1>

          <p className="text-base text-gray-400 sm:text-lg leading-relaxed max-w-xl">
            {description}
          </p>

          {/* Primary CTA Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
            <button
              onClick={onStartQuiz}
              className="px-10 py-5 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 text-black font-black uppercase text-xl tracking-tighter hover:scale-105 active:scale-95 transition-transform rounded-sm shadow-[0_0_40px_rgba(234,179,8,0.2)] flex items-center justify-center gap-3"
            >
              <Scissors className="h-6 w-6 text-black" />
              <span>{ctaText}</span>
              <ChevronRight className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-2 px-2 text-xs text-gray-400 uppercase font-semibold tracking-wider">
              <Clock className="h-4 w-4 text-yellow-400" />
              <span>{ctaSubtext}</span>
            </div>
          </div>

          {/* Highlights Pills */}
          <div className="grid grid-cols-2 gap-3 pt-6 border-t border-white/5 sm:grid-cols-4">
            <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
              <Scissors className="h-4 w-4 text-yellow-400 shrink-0" />
              <span>{pill1}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
              <Award className="h-4 w-4 text-yellow-400 shrink-0" />
              <span>{pill2}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
              <Shield className="h-4 w-4 text-yellow-400 shrink-0" />
              <span>{pill3}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
              <CheckCircle2 className="h-4 w-4 text-yellow-400 shrink-0" />
              <span>{pill4}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Menu Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-bold text-yellow-500 uppercase tracking-[0.3em]">{servicesSubtitle}</p>
            <h2 className="font-syne text-2xl font-black uppercase text-white sm:text-3xl">{servicesTitle}</h2>
          </div>
          <button
            onClick={onStartQuiz}
            className="text-xs font-bold text-yellow-400 hover:text-yellow-300 uppercase tracking-widest flex items-center gap-1"
          >
            Ver no Quiz <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {services.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#0F0F0F] p-8 text-center text-gray-400 space-y-2">
            <Scissors className="h-8 w-8 mx-auto text-yellow-500/50" />
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-300">Nenhum serviço disponível no momento</p>
            <p className="text-xs text-gray-500">Cadastre serviços no Painel Administrativo para exibi-los aqui.</p>
          </div>
        ) : (
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
                    <span className="font-syne text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500">
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
        )}
      </section>

      {/* Barbers Team Showcase */}
      <section className="space-y-6">
        <div className="border-b border-white/10 pb-4">
          <p className="text-xs font-bold text-yellow-500 uppercase tracking-[0.3em]">{teamSubtitle}</p>
          <h2 className="font-syne text-2xl font-black uppercase text-white sm:text-3xl">{teamTitle}</h2>
        </div>

        {barbers.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#0F0F0F] p-8 text-center text-gray-400 space-y-2">
            <Award className="h-8 w-8 mx-auto text-yellow-500/50" />
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-300">Nenhum barbeiro cadastrado no momento</p>
            <p className="text-xs text-gray-500">Cadastre a equipe de barbeiros no Painel Administrativo para exibi-los aqui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {barbers.map((barber) => (
              <div
                key={barber.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F0F0F] transition-all hover:border-yellow-500/40 p-3 sm:p-4 flex flex-row items-start gap-3 sm:gap-4"
              >
                {/* Imagem compacta no lado esquerdo */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 overflow-hidden rounded-xl bg-black border border-white/10 shadow-md">
                  <img
                    src={barber.avatar}
                    alt={barber.name}
                    width={500}
                    height={500}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>

                {/* Descrição e Tags ao LADO DIREITO alinhados à imagem */}
                <div className="flex-1 min-w-0 space-y-2 flex flex-col justify-between py-0.5 text-left">
                  <div className="space-y-1.5">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="rounded bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300 uppercase tracking-widest inline-block">
                          DISPONÍVEL HOJE
                        </span>
                        <div className="flex items-center gap-1 bg-yellow-400/10 border border-yellow-400/30 px-2 py-0.5 rounded-full shrink-0">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-extrabold text-yellow-400">{barber.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <h3 className="font-syne text-base font-bold text-white uppercase tracking-tight truncate">{barber.name}</h3>
                      <p className="text-[11px] font-bold text-yellow-500 uppercase tracking-wider">{barber.role}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Especialidades:</span>
                      <div className="flex flex-wrap gap-1">
                        {barber.specialties.map((spec, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-gray-300 border border-white/5 font-semibold"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={onStartQuiz}
                    className="w-full mt-1 rounded-lg bg-yellow-400 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-black transition-colors hover:bg-yellow-300 shadow-md"
                  >
                    Agendar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Interactive Quiz Callout Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-yellow-500/30 bg-[#0F0F0F] p-8 text-center sm:p-12 shadow-[0_0_50px_rgba(234,179,8,0.1)]">
        <div className="mx-auto max-w-xl space-y-5">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 text-black font-bold shadow-[0_0_20px_rgba(234,179,8,0.3)]">
            <Scissors className="h-6 w-6" />
          </div>
          <h2 className="font-syne text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
            {bannerTitle}
          </h2>
          <p className="text-xs text-gray-400 sm:text-sm leading-relaxed">
            {bannerDesc}
          </p>
          <button
            onClick={onStartQuiz}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 text-black font-black uppercase text-base tracking-tighter hover:scale-105 active:scale-95 transition-transform rounded-sm shadow-[0_0_30px_rgba(234,179,8,0.2)]"
          >
            <span>{bannerBtnText}</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
};
