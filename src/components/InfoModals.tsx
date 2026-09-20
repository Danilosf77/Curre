import React, { useState } from 'react';
import { X, CheckCircle2, Sparkles, Layers, ShieldCheck, FileCheck, ArrowRight, Zap, Cloud, Mail, LogOut, Check } from 'lucide-react';
import { UserProfile } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
  onLogout?: () => void;
}

export const HowItWorksModal: React.FC<ModalProps & { onStart: () => void }> = ({ isOpen, onClose, onStart }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/90 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
            💡
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Como funciona o CURRÊ?</h2>
            <p className="text-xs text-slate-500">Corra atrás da vaga certa em apenas 3 passos simples</p>
          </div>
        </div>

        <div className="space-y-4 my-6">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/70 border border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-sky-600 text-white font-extrabold flex items-center justify-center shrink-0 text-sm">
              1
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Preencha suas informações</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Informe seus dados de contato, formação e experiências. Não se preocupe em usar palavras difíceis — escreva com suas próprias palavras como era sua rotina.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/70 border border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white font-extrabold flex items-center justify-center shrink-0 text-sm">
              2
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Cole a vaga desejada (opcional)</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                A IA analisa os requisitos e palavras-chave da vaga para destacar as suas experiências e qualificações reais mais compatíveis.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/70 border border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center shrink-0 text-sm">
              3
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Receba seu currículo em PDF</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Pronto para envio! Em formato profissional aprovado por recrutadores e pronto para impressão ou envio por e-mail e WhatsApp.
              </p>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-100 text-xs text-sky-800 flex items-center gap-2 mb-6">
          <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
          <span>A IA do CURRÊ nunca inventa experiências falsas. Apenas valoriza sua história real.</span>
        </div>

        <button
          onClick={() => {
            onClose();
            onStart();
          }}
          className="w-full liquid-glass-button text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-sky-500/30"
        >
          <span>CRIAR MEU CURRÍCULO AGORA</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const FeaturesModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/90 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Recursos do CURRÊ</h2>
            <p className="text-xs text-slate-500">Tecnologia desenhada para seu crescimento profissional</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-5">
          <div className="p-4 rounded-2xl bg-white/70 border border-slate-100">
            <Sparkles className="w-5 h-5 text-sky-600 mb-2" />
            <h4 className="font-bold text-slate-900 text-sm">Refinamento de Redação</h4>
            <p className="text-xs text-slate-600 mt-1">
              Converte frases simples em marcadores de ação de alto impacto reconhecidos em seleções.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 border border-slate-100">
            <Zap className="w-5 h-5 text-cyan-600 mb-2" />
            <h4 className="font-bold text-slate-900 text-sm">Leitor de Vaga Inteligente</h4>
            <p className="text-xs text-slate-600 mt-1">
              Extrai competências-chave da vaga e posiciona seu perfil com máxima relevância.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 border border-slate-100">
            <FileCheck className="w-5 h-5 text-blue-600 mb-2" />
            <h4 className="font-bold text-slate-900 text-sm">Padrão Limpo ATS</h4>
            <p className="text-xs text-slate-600 mt-1">
              Formatado para passar sem erros em robôs de triagem (Gupy, Kenoby, LinkedIn).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 border border-slate-100">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mb-2" />
            <h4 className="font-bold text-slate-900 text-sm">Privacidade Total</h4>
            <p className="text-xs text-slate-600 mt-1">
              Não pedimos documentos confidenciais como CPF ou RG. Seus dados são seus.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [mode, setMode] = useState<'main' | 'email'>('main');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const user: UserProfile = {
        id: 'usr_' + Date.now(),
        name: 'Usuário Google',
        email: 'usuario.google@gmail.com',
        avatarUrl: '',
        provider: 'google',
        createdAt: new Date().toISOString(),
      };
      onLoginSuccess(user);
      setLoading(false);
      onClose();
    }, 600);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) return;

    setLoading(true);
    setTimeout(() => {
      const extractedName = nameInput.trim() || emailInput.split('@')[0];
      const user: UserProfile = {
        id: 'usr_' + Date.now(),
        name: extractedName.charAt(0).toUpperCase() + extractedName.slice(1),
        email: emailInput.trim(),
        avatarUrl: '',
        provider: 'email',
        createdAt: new Date().toISOString(),
      };
      onLoginSuccess(user);
      setLoading(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/90">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {currentUser ? (
          // Visualização quando o usuário já está logado
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-sky-500/30 text-lg font-bold">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{currentUser.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{currentUser.email}</p>

            <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold mb-1">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Nuvem Conectada e Ativa</span>
              </div>
              <p className="text-xs text-slate-600">
                Seus currículos gerados nesta sessão estão vinculados à sua conta e protegidos para acesso posterior.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={onClose}
                className="w-full liquid-glass-button text-white font-bold py-3 rounded-xl text-sm shadow-md shadow-sky-500/25 cursor-pointer"
              >
                Continuar usando o CURRÊ
              </button>

              {onLogout && (
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-100 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair da Conta</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          // Fluxo de Login / Cadastro Opcional
          <div>
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-sky-500/30">
                <Cloud className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Salvar na Nuvem (Opcional)</h2>
              <p className="text-xs text-slate-500 mt-1">
                Acesse seus currículos de qualquer computador ou celular
              </p>
            </div>

            {/* Banner de Esclarecimento: Não Obrigatório */}
            <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-100 mb-5 text-left">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>Login 100% Opcional</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Você pode criar e baixar currículos <strong>sem fazer login</strong>. A conta serve apenas para sincronizar seus dados na nuvem e nunca perdê-los.
              </p>
            </div>

            {mode === 'main' ? (
              <div className="space-y-3">
                {/* Botão Google */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  id="login-btn-google"
                  className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold flex items-center justify-center gap-3 shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-70"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{loading ? 'Conectando...' : 'Continuar com Google'}</span>
                </button>

                <div className="flex items-center my-3">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">ou com e-mail</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <button
                  onClick={() => setMode('email')}
                  id="login-btn-email-mode"
                  className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span>Entrar usando meu E-mail</span>
                </button>

                <div className="pt-2">
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                  >
                    Continuar sem login (Salvar apenas no navegador)
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEmailLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Seu Nome (opcional)</label>
                  <input
                    type="text"
                    placeholder="ex: João Silva"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Seu E-mail *</label>
                  <input
                    type="email"
                    required
                    placeholder="ex: seuemail@gmail.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  id="login-btn-submit-email"
                  className="w-full liquid-glass-button text-white font-bold py-3 rounded-xl text-sm shadow-md shadow-sky-500/25 cursor-pointer disabled:opacity-75"
                >
                  {loading ? 'Sincronizando...' : 'Acessar Conta e Ativar Nuvem'}
                </button>

                <button
                  type="button"
                  onClick={() => setMode('main')}
                  className="w-full py-1 text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer text-center"
                >
                  Voltar para opções
                </button>
              </form>
            )}

            <p className="text-center text-[10px] text-slate-400 mt-4 leading-tight">
              Acesso instantâneo sem necessidade de senha para o plano gratuito.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const PrivacyTermsModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/90 max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Termos de Uso e Privacidade (LGPD)</h2>
            <p className="text-xs text-slate-500">Transparência total com suas informações e histórico profissional</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-600 leading-relaxed my-5 pr-1">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
            <h4 className="font-bold text-slate-900 text-xs mb-1">1. Seus Dados São Estritamente Seus</h4>
            <p>
              O <strong>CURRÊ</strong> não vende, não comercializa e não compartilha suas informações pessoais, contatos ou históricos profissionais com empresas terceiras para fins de publicidade.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
            <h4 className="font-bold text-slate-900 text-xs mb-1">2. Não Solicitamos Documentos Confidenciais</h4>
            <p>
              Em conformidade com as boas práticas de segurança, nunca solicitamos números de documentos confidenciais como CPF, RG, CNH, carteira de trabalho ou dados bancários.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
            <h4 className="font-bold text-slate-900 text-xs mb-1">3. Inteligência Artificial Responsável</h4>
            <p>
              Os textos inseridos são processados de forma segura exclusivamente para aprimorar a redação do seu currículo e compará-lo aos requisitos da vaga desejada. A IA não inventa dados e trabalha como assistente de redação profissional.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
            <h4 className="font-bold text-slate-900 text-xs mb-1">4. Armazenamento e Exclusão</h4>
            <p>
              Seus currículos ficam armazenados no seu próprio navegador e, caso utilize o login opcional, são associados com segurança à sua conta. Você pode limpar os dados do navegador a qualquer momento.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Entendido e Fechar
        </button>
      </div>
    </div>
  );
};


