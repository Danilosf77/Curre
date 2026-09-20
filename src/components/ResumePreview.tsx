import React, { useState, useRef } from 'react';
import {
  Download,
  Edit,
  RotateCcw,
  BookmarkCheck,
  Share2,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ChevronLeft,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  Palette,
  Loader2,
  LayoutGrid,
  FileText,
  ScanText,
  Cloud,
} from 'lucide-react';
import { OptimizedResume, UserProfile } from '../types';
import { exportResumeToPDF } from '../utils/pdfExport';
import { LiquidModernTemplate } from './templates/LiquidModernTemplate';
import { ExecutiveClassicTemplate } from './templates/ExecutiveClassicTemplate';
import { MinimalistAtsTemplate } from './templates/MinimalistAtsTemplate';

interface ResumePreviewProps {
  resume: OptimizedResume;
  onEdit: () => void;
  onRegenerate: () => void;
  onAdaptOtherJob: () => void;
  onBackToHome: () => void;
  currentUser?: UserProfile | null;
  onOpenLogin?: () => void;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  resume,
  onEdit,
  onRegenerate,
  onAdaptOtherJob,
  onBackToHome,
  currentUser,
  onOpenLogin,
}) => {
  const [template, setTemplate] = useState<'liquid-modern' | 'executive-clean' | 'minimalist'>(
    resume.templateStyle || 'liquid-modern'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showCompatibility, setShowCompatibility] = useState(true);

  const resumeRef = useRef<HTMLDivElement>(null);

  // Auto-salva no navegador assim que o currículo é gerado/visualizado
  React.useEffect(() => {
    if (resume && resume.personal?.fullName) {
      try {
        localStorage.setItem('curre_saved_resume', JSON.stringify(resume));
      } catch (e) {
        console.error(e);
      }
    }
  }, [resume]);

  // Handle Real PDF Download
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await exportResumeToPDF('resume-document', resume.personal?.fullName || 'Curriculo');
    } catch (err) {
      console.error('PDF export failed:', err);
      window.print();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Handle Local Save
  const handleSaveLocally = () => {
    try {
      localStorage.setItem('curre_saved_resume', JSON.stringify(resume));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const { personal, targetRole, professionalSummary, experiences, education, skills, tools, courses, jobAnalysis } =
    resume;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-2 pb-24">
      {/* Top Action Bar (hidden on print) */}
      <div className="no-print mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-white/80 border border-slate-200 shadow-sm cursor-pointer"
              title="Voltar ao início"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Currículo Pronto
                </span>
                <span className="text-xs text-slate-400">• Otimizado com IA</span>
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 mt-0.5">
                {personal.fullName || 'Seu Currículo'}
              </h1>
            </div>
          </div>

          {/* Quick Actions (Fileira Superior) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onAdaptOtherJob}
              id="btn-adapt-other-job"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-sky-800 bg-sky-50 border border-sky-200 hover:bg-sky-100 flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
              title="Adaptar este currículo para uma nova vaga"
            >
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>Adaptar para vaga</span>
            </button>

            <button
              onClick={onEdit}
              id="btn-edit-resume"
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Voltar para a Etapa 8 (Revisão e Ajustes)"
            >
              <Edit className="w-4 h-4 text-slate-500" />
              <span>Editar</span>
            </button>

            <button
              onClick={onRegenerate}
              id="btn-regenerate"
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Gerar novamente aprimorando o texto"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Gerar novamente</span>
            </button>

            <button
              onClick={handleSaveLocally}
              id="btn-save-resume"
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <BookmarkCheck className="w-4 h-4 text-emerald-600" />
              <span>{savedSuccess ? 'Salvo!' : 'Salvar'}</span>
            </button>
          </div>
        </div>

        {/* Fileira Inferior: Botão BAIXAR PDF em Máximo Destaque, Mais Comprido e Centralizado */}
        <div className="pt-3 pb-1 flex justify-center w-full">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            id="btn-download-pdf"
            className="w-full sm:w-auto min-w-[280px] sm:min-w-[420px] md:min-w-[500px] py-3.5 px-8 rounded-2xl bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-extrabold text-sm sm:text-base tracking-wide flex items-center justify-center gap-3 shadow-xl shadow-sky-500/30 hover:shadow-2xl hover:shadow-sky-500/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none border border-sky-400/30"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>GERANDO PDF PROFISSIONAL...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5 text-sky-100" />
                <span>BAIXAR CURRÍCULO EM PDF</span>
              </>
            )}
          </button>
        </div>

        {/* Sugestão Opcional de Salvar na Nuvem */}
        {currentUser ? (
          <div className="my-4 p-3.5 sm:p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 shadow-sm flex items-center justify-between gap-3 text-left animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                <Cloud className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                    Nuvem Sincronizada
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    Conectado como {currentUser.name} ({currentUser.email})
                  </span>
                </div>
                <p className="text-xs text-emerald-800/80 mt-0.5">
                  Este currículo está salvo na sua nuvem e protegido para acesso em qualquer dispositivo.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block text-[11px] font-bold text-emerald-700 bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-200 shrink-0">
              Salvo na Nuvem
            </span>
          </div>
        ) : (
          <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-sky-50/90 via-cyan-50/70 to-blue-50/80 border border-sky-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left animate-in fade-in duration-200">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/20">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md border border-sky-200">
                    Opcional • Salvar na Nuvem
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    Deseja acessar este currículo em outro celular ou computador?
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Seu currículo já está pronto e salvo no navegador atual. Se preferir deixá-lo guardado na nuvem para não perder, faça login gratuito (com 1 clique).
                </p>
              </div>
            </div>
            {onOpenLogin && (
              <button
                onClick={onOpenLogin}
                id="preview-btn-cloud-login"
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all shrink-0"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Salvar na Nuvem (Login)</span>
              </button>
            )}
          </div>
        )}

        {/* Template Selector Ribbon with clear value differentiation */}
        <div className="pt-3 border-t border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Palette className="w-4 h-4 text-sky-600" />
              <span>Escolha o Estilo do Currículo:</span>
            </div>

            <div className="text-[11px] text-slate-400">
              Dica: Clique em <strong>BAIXAR PDF</strong> para exportar com fidelidade máxima.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            {/* Template 1: Moderno Clean */}
            <button
              onClick={() => setTemplate('liquid-modern')}
              id="template-btn-modern"
              className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer relative ${
                template === 'liquid-modern'
                  ? 'bg-sky-50/90 border-sky-500 shadow-md ring-2 ring-sky-400/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5 text-sky-600" />
                  Moderno Clean
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-100 text-sky-700">
                  Tech & Inovação
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Design limpo, objetivo e sem ruído visual, baseado no padrão mais buscado por big techs e startups.
              </p>
            </button>

            {/* Template 2: Executivo Clássico */}
            <button
              onClick={() => setTemplate('executive-clean')}
              id="template-btn-executive"
              className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer relative ${
                template === 'executive-clean'
                  ? 'bg-slate-100/90 border-slate-900 shadow-md ring-2 ring-slate-900/10'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-800" />
                  Executivo Clássico
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                  Corporativo
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Diagramação nobre centralizada com tipografia serifada e divisores duplos. Padrão para liderança e finanças.
              </p>
            </button>

            {/* Template 3: Lateral Estruturado */}
            <button
              onClick={() => setTemplate('minimalist')}
              id="template-btn-sidebar"
              className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer relative ${
                template === 'minimalist'
                  ? 'bg-indigo-50/90 border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                  <ScanText className="w-3.5 h-3.5 text-indigo-600" />
                  Lateral Estruturado (2 Colunas)
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  Design & Impacto
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Layout moderno em duas colunas com painel lateral dedicado para competências, contato e formação.
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          RECURSO PREMIUM / ANÁLISE DE COMPATIBILIDADE COM A VAGA
      ========================================================================= */}
      {jobAnalysis && showCompatibility && (
        <div className="no-print mb-8 p-5 sm:p-6 rounded-3xl liquid-glass-card border border-sky-200 shadow-md animate-in fade-in">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-sky-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-sky-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                  Recurso Inteligente • Análise de Vaga
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Compatibilidade com esta vaga
                </h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-extrabold text-sky-700">
                {jobAnalysis.matchPercentage}%
              </span>
              <span className="text-[11px] text-slate-500 block -mt-1 font-medium">
                Aderência ao perfil
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Found Skills */}
            <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-100">
              <span className="font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Competências Encontradas
              </span>
              <ul className="space-y-1">
                {jobAnalysis.foundSkills.slice(0, 4).map((s, i) => (
                  <li key={i} className="text-slate-700 flex items-center gap-1">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Relevant Experiences */}
            <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-100">
              <span className="font-bold text-sky-800 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                Experiências Relevantes
              </span>
              <ul className="space-y-1">
                {jobAnalysis.relevantExperiences.slice(0, 2).map((exp, i) => (
                  <li key={i} className="text-slate-700 flex items-center gap-1">
                    <span className="text-sky-500 font-bold">•</span>
                    <span>{exp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements / Attention Points */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <span className="font-bold text-amber-900 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Pontos de Melhoria
              </span>
              <ul className="space-y-1 text-slate-700">
                {jobAnalysis.improvements.slice(0, 2).map((imp, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Ethical Disclaimer mandated by rules */}
          <p className="text-[11px] text-slate-400 mt-4 text-center">
            * A análise de compatibilidade é um diagnóstico técnico comparativo e não garante contratação nem aprovação em processos seletivos.
          </p>
        </div>
      )}

      {/* =========================================================================
          REALISTIC RESUME PAPER (A4 Document Preview)
      ========================================================================= */}
      <div
        className="flex justify-center select-none"
        onContextMenu={(e) => e.preventDefault()}
      >
        <div
          ref={resumeRef}
          id="resume-document"
          onContextMenu={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          className={`resume-paper select-none w-full max-w-[820px] bg-white text-slate-900 shadow-2xl rounded-xl sm:rounded-2xl transition-all border border-slate-200/80 overflow-hidden print:max-w-none print:shadow-none print:border-none ${
            template === 'liquid-modern'
              ? 'p-6 sm:p-10 font-sans'
              : template === 'executive-clean'
              ? 'p-6 sm:p-10 font-serif'
              : 'p-0 font-sans'
          }`}
          style={{ minHeight: '1050px', userSelect: 'none', WebkitUserSelect: 'none' }}
        >
          {template === 'liquid-modern' && (
            <LiquidModernTemplate
              personal={personal}
              targetRole={targetRole}
              professionalSummary={professionalSummary}
              experiences={experiences}
              education={education}
              skills={skills}
              tools={tools}
              courses={courses}
            />
          )}

          {template === 'executive-clean' && (
            <ExecutiveClassicTemplate
              personal={personal}
              targetRole={targetRole}
              professionalSummary={professionalSummary}
              experiences={experiences}
              education={education}
              skills={skills}
              tools={tools}
              courses={courses}
            />
          )}

          {template === 'minimalist' && (
            <MinimalistAtsTemplate
              personal={personal}
              targetRole={targetRole}
              professionalSummary={professionalSummary}
              experiences={experiences}
              education={education}
              skills={skills}
              tools={tools}
              courses={courses}
            />
          )}
        </div>
      </div>

      {/* Bottom Floating Bar on Mobile (no-print) */}
      <div className="no-print sm:hidden fixed bottom-3 left-4 right-4 z-30">
        <div className="liquid-glass rounded-2xl p-3 shadow-xl border border-white flex items-center justify-between gap-2">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="flex-1 liquid-glass-button text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-500/30 disabled:opacity-75 cursor-pointer"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Criando PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Baixar PDF</span>
              </>
            )}
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700"
          >
            Editar
          </button>
        </div>
      </div>
    </div>
  );
};
