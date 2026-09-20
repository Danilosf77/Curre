import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Award, Zap, FileText, ChevronRight, UserCheck, Search, Clock, Cloud } from 'lucide-react';
import { OptimizedResume, UserProfile } from '../types';

interface LandingHeroProps {
  onStartResume: () => void;
  onOpenHowItWorks: () => void;
  savedResume?: OptimizedResume | null;
  onOpenSavedResume?: () => void;
  currentUser?: UserProfile | null;
  onOpenLogin?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartResume,
  onOpenHowItWorks,
  savedResume,
  onOpenSavedResume,
  currentUser,
  onOpenLogin,
}) => {
  // Animated simulation state for the liquid glass resume preview
  const [activeStepAnim, setActiveStepAnim] = useState(0);

  const simulationSteps = [
    {
      title: "1. Informações básicas",
      detail: "João Silva • Analista Administrativo",
      badge: "Preenchimento simples",
    },
    {
      title: "2. Experiência informal",
      detail: '"Cuidava das notas e planilhas no setor..."',
      badge: "Linguagem própria",
    },
    {
      title: "3. Otimização com IA CURRÊ",
      detail: '→ "Gerenciou rotinas fiscais e controle de faturamento via Excel"',
      badge: "Padrão de recrutamento",
    },
    {
      title: "4. Alinhamento com a vaga",
      detail: 'Requisitos correspondentes: 92% de compatibilidade',
      badge: "Currículo pronto em PDF!",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStepAnim((prev) => (prev + 1) % simulationSteps.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden pt-4 pb-16 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[360px] bg-gradient-to-tr from-sky-400/20 via-cyan-300/20 to-blue-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-10 right-4 w-72 h-72 bg-blue-300/15 rounded-full blur-2xl -z-10 pointer-events-none" />

      {/* Hero Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center pt-4">
        {/* Left Column: Headlines & CTAs */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          {/* Subtle Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-subtle text-xs font-semibold text-sky-800 shadow-sm border border-sky-200/60">
            <Sparkles className="w-3.5 h-3.5 text-sky-600 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Inteligência Artificial Feita para Quem Precisa de Resultados</span>
          </div>

          {/* Main Hero Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-[44px] font-extrabold text-slate-900 tracking-tight leading-[1.18]">
            Seu próximo emprego pode começar com um{' '}
            <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              currículo melhor.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
            Crie um currículo profissional com inteligência artificial e adapte sua apresentação para a vaga que você deseja.
          </p>

          {/* Banner de Currículo Salvo no Navegador */}
          {savedResume && onOpenSavedResume && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-cyan-50 to-blue-50 border border-sky-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md border border-sky-200">
                      Sessão Salva
                    </span>
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs">
                      {savedResume.personal?.fullName || 'Currículo Salvo'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Cargo: <strong>{savedResume.targetRole || 'Profissional'}</strong> • Pronto para download ou edição
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  onClick={onOpenSavedResume}
                  id="hero-btn-open-saved"
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Abrir Salvo</span>
                </button>
                <button
                  onClick={onStartResume}
                  id="hero-btn-create-new-alt"
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 cursor-pointer transition-all text-center"
                >
                  Novo
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
            <button
              onClick={onStartResume}
              id="hero-btn-create-resume"
              className="w-full sm:w-auto liquid-glass-button text-white font-bold px-7 py-3.5 rounded-xl text-base flex items-center justify-center gap-3 group cursor-pointer shadow-lg shadow-sky-500/30"
            >
              <span>CRIAR MEU CURRÍCULO</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onOpenHowItWorks}
              id="hero-btn-how-it-works"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-base font-semibold text-slate-700 hover:text-slate-900 liquid-glass hover:bg-white/80 transition-all border border-slate-200/80 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>COMO FUNCIONA</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Micro trust indicators */}
          <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-5 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>100% gratuito</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Sem cadastro obrigatório</span>
            </div>
            {currentUser ? (
              <div className="flex items-center gap-1.5 text-sky-800 font-semibold bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                <Cloud className="w-3.5 h-3.5 text-sky-600" />
                <span>Nuvem ativa ({currentUser.name})</span>
              </div>
            ) : (
              onOpenLogin && (
                <button
                  onClick={onOpenLogin}
                  className="flex items-center gap-1.5 text-sky-700 hover:text-sky-950 font-bold bg-sky-50/80 hover:bg-sky-100 px-2.5 py-1 rounded-lg border border-sky-200 transition-all cursor-pointer"
                  title="Deseja salvar na nuvem? Login gratuito opcional"
                >
                  <Cloud className="w-3.5 h-3.5 text-sky-600" />
                  <span>Salvar na Nuvem (Opcional)</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Right Column: Interactive Animated Liquid Glass Simulation */}
        <div className="lg:col-span-5">
          <div className="relative mx-auto max-w-md">
            {/* Ambient card background glow */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-sky-400/40 via-cyan-400/30 to-blue-500/40 rounded-3xl blur-xl opacity-70" />

            <div className="relative liquid-glass-card rounded-2xl p-5 sm:p-6 shadow-2xl border border-white/90">
              {/* Header inside simulation */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-rose-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                  <span className="text-xs font-semibold text-slate-400 ml-1">
                    CURRÊ • Transformação em Tempo Real
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                  <Sparkles className="w-3 h-3 text-sky-500" />
                  IA Ativa
                </span>
              </div>

              {/* Dynamic steps tracker */}
              <div className="space-y-3">
                {simulationSteps.map((step, idx) => {
                  const isActive = activeStepAnim === idx;
                  const isPast = activeStepAnim > idx;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl transition-all duration-300 border ${
                        isActive
                          ? 'bg-gradient-to-r from-sky-50/90 to-white/90 border-sky-300 shadow-sm scale-[1.01]'
                          : isPast
                          ? 'bg-slate-50/50 border-slate-100 opacity-80'
                          : 'bg-white/40 border-transparent opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isActive
                                ? 'bg-sky-600 text-white'
                                : isPast
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isPast ? '✓' : idx + 1}
                          </div>
                          <span
                            className={`text-xs font-semibold ${
                              isActive ? 'text-sky-900' : 'text-slate-700'
                            }`}
                          >
                            {step.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-medium text-slate-500 px-2 py-0.5 rounded bg-white/70">
                          {step.badge}
                        </span>
                      </div>
                      <p
                        className={`text-xs pl-7 font-mono ${
                          isActive
                            ? 'text-sky-800 font-semibold'
                            : 'text-slate-500'
                        }`}
                      >
                        {step.detail}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Interactive bottom micro-banner */}
              <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-sky-600" />
                  <span className="font-medium">Sem inventar experiências</span>
                </div>
                <button
                  onClick={onStartResume}
                  className="text-sky-600 font-bold hover:underline flex items-center gap-1 text-xs"
                >
                  Experimente agora →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key value cards below hero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16">
        <div className="liquid-glass-card rounded-2xl p-5 hover:border-sky-300 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">
            Fácil como uma conversa
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Escreva suas tarefas cotidianas com suas próprias palavras. A IA organiza em linguagem corporativa respeitada por recrutadores.
          </p>
        </div>

        <div className="liquid-glass-card rounded-2xl p-5 hover:border-sky-300 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">
            Alinhado à Vaga de Emprego
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Cole a descrição da oportunidade e o CURRÊ destaca exatamente as suas experiências e habilidades reais que atendem aos requisitos.
          </p>
        </div>

        <div className="liquid-glass-card rounded-2xl p-5 hover:border-sky-300 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">
            Ético e 100% Confiável
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Garantia estrita de integridade: a IA nunca inventa cursos, empresas ou resultados falsos. Seu currículo sempre reflete sua verdade.
          </p>
        </div>
      </div>
    </div>
  );
};
