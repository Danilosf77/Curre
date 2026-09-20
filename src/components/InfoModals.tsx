import React, { useState } from 'react';
import { X, CheckCircle2, Sparkles, Layers, ShieldCheck, FileCheck, ArrowRight, Zap, Cloud, Mail, LogOut, Check } from 'lucide-react';
import { UserProfile } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

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

const MODAL_T = {
  pt: {
    how_it_works_title: 'Como funciona o CURRÊ?',
    how_it_works_subtitle: 'Corra atrás da vaga certa em apenas 3 passos simples',
    step_1_title: 'Preencha suas informações',
    step_1_desc: 'Informe seus dados de contato, formação e experiências. Não se preocupe em usar palavras difíceis — escreva com suas próprias palavras como era sua rotina.',
    step_2_title: 'Cole a vaga desejada (opcional)',
    step_2_desc: 'A IA analisa os requisitos e palavras-chave da vaga para destacar as suas experiências e qualificações reais mais compatíveis.',
    step_3_title: 'Receba seu currículo em PDF',
    step_3_desc: 'Pronto para envio! Em formato profissional aprovado por recrutadores e pronto para impressão ou envio por e-mail e WhatsApp.',
    how_it_works_ethics: 'A IA do CURRÊ nunca inventa experiências falsas. Apenas valoriza sua história real.',
    how_it_works_btn: 'CRIAR MEU CURRÍCULO AGORA',
    
    features_title: 'Recursos do CURRÊ',
    features_subtitle: 'Tecnologia desenhada para seu crescimento profissional',
    feat_1_title: 'Refinamento de Redação',
    feat_1_desc: 'Converte frases simples em marcadores de ação de alto impacto reconhecidos em seleções.',
    feat_2_title: 'Leitor de Vaga Inteligente',
    feat_2_desc: 'Extrai competências-chave da vaga e posiciona seu perfil com máxima relevância.',
    feat_3_title: 'Padrão Limpo ATS',
    feat_3_desc: 'Formatado para passar sem erros em robôs de triagem (Gupy, Kenoby, LinkedIn).',
    feat_4_title: 'Privacidade Total',
    feat_4_desc: 'Não pedimos documentos confidenciais como CPF ou RG. Seus dados são seus.',
    close_btn: 'Fechar',

    login_active_title: 'Nuvem Conectada e Ativa',
    login_active_desc: 'Seus currículos gerados nesta sessão estão vinculados à sua conta e protegidos para acesso posterior.',
    login_active_continue: 'Continuar usando o CURRÊ',
    login_active_logout: 'Sair da Conta',
    login_title: 'Salvar na Nuvem (Opcional)',
    login_subtitle: 'Acesse seus currículos de qualquer computador ou celular',
    login_opt_title: 'Login 100% Opcional',
    login_opt_desc: 'Você pode criar e baixar currículos sem fazer login. A conta serve apenas para sincronizar seus dados na nuvem e nunca perdê-los.',
    login_google: 'Continuar com Google',
    login_google_loading: 'Conectando...',
    login_or_email: 'ou com e-mail',
    login_email_btn: 'Entrar usando meu E-mail',
    login_skip: 'Continuar sem login (Salvar apenas no navegador)',
    login_name_label: 'Seu Nome (opcional)',
    login_name_ph: 'ex: João Silva',
    login_email_label: 'Seu E-mail *',
    login_email_ph: 'ex: seuemail@gmail.com',
    login_submit_email: 'Acessar Conta e Ativar Nuvem',
    login_submit_email_loading: 'Sincronizando...',
    login_back: 'Voltar para opções',
    login_disclaimer: 'Acesso instantâneo sem necessidade de senha para o plano gratuito.',

    privacy_title: 'Termos de Uso e Privacidade (LGPD)',
    privacy_subtitle: 'Transparência total com suas informações e histórico profissional',
    privacy_sec_1_title: '1. Seus Dados São Estritamente Seus',
    privacy_sec_1_desc: 'O CURRÊ não vende, não comercializa e não compartilha suas informações pessoais, contatos ou históricos profissionais com empresas terceiras para fins de publicidade.',
    privacy_sec_2_title: '2. Não Solicitamos Documentos Confidenciais',
    privacy_sec_2_desc: 'Em conformidade com as boas práticas de segurança, nunca solicitamos números de documentos confidenciais como CPF, RG, CNH, carteira de trabalho ou dados bancários.',
    privacy_sec_3_title: '3. Inteligência Artificial Responsável',
    privacy_sec_3_desc: 'Os textos inseridos são processados de forma segura exclusivamente para aprimorar a redação do seu currículo e compará-lo aos requisitos da vaga desejada. A IA não inventa dados e trabalha como assistente de redação profissional.',
    privacy_sec_4_title: '4. Armazenamento e Exclusão',
    privacy_sec_4_desc: 'Seus currículos ficam armazenados no seu próprio navegador e, caso utilize o login opcional, são associados com segurança à sua conta. Você pode limpar os dados do navegador a qualquer momento.',
    privacy_understand: 'Entendido e Fechar'
  },
  en: {
    how_it_works_title: 'How does CURRÊ work?',
    how_it_works_subtitle: 'Chase the right job in just 3 simple steps',
    step_1_title: 'Fill in your information',
    step_1_desc: 'Enter your contact details, education, and experiences. Don\'t worry about using difficult words — write in your own words what your routine was like.',
    step_2_title: 'Paste the desired job (optional)',
    step_2_desc: 'The AI analyzes the requirements and keywords of the job to highlight your most compatible real experiences and qualifications.',
    step_3_title: 'Receive your resume in PDF',
    step_3_desc: 'Ready to send! In a professional format approved by recruiters and ready for printing or sending via email and WhatsApp.',
    how_it_works_ethics: 'CURRÊ\'s AI never invents false experiences. It only highlights your real story.',
    how_it_works_btn: 'CREATE MY RESUME NOW',
    
    features_title: 'CURRÊ Features',
    features_subtitle: 'Technology designed for your professional growth',
    feat_1_title: 'Writing Refinement',
    feat_1_desc: 'Converts simple sentences into high-impact action bullet points recognized in selection processes.',
    feat_2_title: 'Smart Job Reader',
    feat_2_desc: 'Extracts key competencies from the job description and positions your profile with maximum relevance.',
    feat_3_title: 'Clean ATS Standard',
    feat_3_desc: 'Formatted to pass without errors through applicant tracking systems (Gupy, Kenoby, LinkedIn).',
    feat_4_title: 'Total Privacy',
    feat_4_desc: 'We do not ask for confidential documents like social security numbers or IDs. Your data is yours.',
    close_btn: 'Close',

    login_active_title: 'Cloud Connected and Active',
    login_active_desc: 'Your resumes generated in this session are linked to your account and protected for future access.',
    login_active_continue: 'Continue using CURRÊ',
    login_active_logout: 'Log Out of Account',
    login_title: 'Save to Cloud (Optional)',
    login_subtitle: 'Access your resumes from any computer or phone',
    login_opt_title: '100% Optional Login',
    login_opt_desc: 'You can create and download resumes without logging in. The account only serves to sync your data to the cloud so you never lose it.',
    login_google: 'Continue with Google',
    login_google_loading: 'Connecting...',
    login_or_email: 'or with email',
    login_email_btn: 'Sign in with Email',
    login_skip: 'Continue without login (Save only in browser)',
    login_name_label: 'Your Name (optional)',
    login_name_ph: 'ex: John Doe',
    login_email_label: 'Your Email *',
    login_email_ph: 'ex: youremail@gmail.com',
    login_submit_email: 'Access Account and Activate Cloud',
    login_submit_email_loading: 'Syncing...',
    login_back: 'Back to options',
    login_disclaimer: 'Instant passwordless access for the free plan.',

    privacy_title: 'Terms of Use and Privacy',
    privacy_subtitle: 'Total transparency with your information and professional history',
    privacy_sec_1_title: '1. Your Data is Strictly Yours',
    privacy_sec_1_desc: 'CURRÊ does not sell, trade, or share your personal information, contacts, or professional histories with third-party companies for advertising purposes.',
    privacy_sec_2_title: '2. We Do Not Request Confidential Documents',
    privacy_sec_2_desc: 'In compliance with best security practices, we never ask for confidential document numbers like social security, ID, driver\'s licenses, or bank details.',
    privacy_sec_3_title: '3. Responsible Artificial Intelligence',
    privacy_sec_3_desc: 'The entered texts are processed securely exclusively to improve your resume writing and match it with the desired job requirements. The AI does not invent data and works as a professional writing assistant.',
    privacy_sec_4_title: '4. Storage and Deletion',
    privacy_sec_4_desc: 'Your resumes are stored in your own browser and, if you use the optional login, are securely linked to your account. You can clear your browser data at any time.',
    privacy_understand: 'Understood & Close'
  },
  es: {
    how_it_works_title: '¿Cómo funciona CURRÊ?',
    how_it_works_subtitle: 'Ve tras el trabajo adecuado en solo 3 sencillos pasos',
    step_1_title: 'Completa tu información',
    step_1_desc: 'Ingresa tus datos de contacto, educación y experiencias. No te preocupes por usar palabras difíciles: escribe con tus propias palabras cómo era tu rutina.',
    step_2_title: 'Pega la vacante deseada (opcional)',
    step_2_desc: 'La IA analiza los requisitos y las palabras clave de la vacante para destacar tus experiencias y calificaciones reales más compatibles.',
    step_3_title: 'Recibe tu currículum en PDF',
    step_3_desc: '¡Listo para enviar! En formato profesional aprobado por reclutadores y listo para imprimir o enviar por correo electrónico y WhatsApp.',
    how_it_works_ethics: 'La IA de CURRÊ nunca inventa experiencias falsas. Solo pone en valor tu historia real.',
    how_it_works_btn: 'CREAR MI CURRÍCULUM AHORA',
    
    features_title: 'Recursos de CURRÊ',
    features_subtitle: 'Tecnología diseñada para tu crecimiento profesional',
    feat_1_title: 'Refinamento de Redação',
    feat_1_desc: 'Convierte frases simples en viñetas de acción de alto impacto reconocidas en procesos de selección.',
    feat_2_title: 'Lector de Vacantes Inteligente',
    feat_2_desc: 'Extrae competencias clave de la vacante y posiciona tu perfil con la máxima relevancia.',
    feat_3_title: 'Estándar ATS Limpio',
    feat_3_desc: 'Formateado para pasar sin errores por los robots de selección (Gupy, Kenoby, LinkedIn).',
    feat_4_title: 'Privacidad Total',
    feat_4_desc: 'No solicitamos documentos confidenciales como números de identificación o documentos oficiales. Tus datos son tuyos.',
    close_btn: 'Cerrar',

    login_active_title: 'Nube Conectada y Activa',
    login_active_desc: 'Tus currículos generados en esta sesión están vinculados a tu cuenta y protegidos para acceso posterior.',
    login_active_continue: 'Continuar usando CURRÊ',
    login_active_logout: 'Cerrar Sesión',
    login_title: 'Guardar en la Nube (Opcional)',
    login_subtitle: 'Accede a tus currículos desde cualquier ordenador o móvil',
    login_opt_title: 'Acceso 100% Opcional',
    login_opt_desc: 'Puedes crear y descargar currículos sin iniciar sesión. La cuenta solo sirve para sincronizar tus datos en la nube y no perderlos nunca.',
    login_google: 'Continuar con Google',
    login_google_loading: 'Conectando...',
    login_or_email: 'o con correo electrónico',
    login_email_btn: 'Iniciar sesión con Email',
    login_skip: 'Continuar sin iniciar sesión (Guardar solo en navegador)',
    login_name_label: 'Tu Nombre (opcional)',
    login_name_ph: 'ej: Juan Pérez',
    login_email_label: 'Tu Email *',
    login_email_ph: 'ej: tuemail@gmail.com',
    login_submit_email: 'Acceder a la Cuenta y Activar Nube',
    login_submit_email_loading: 'Sincronizando...',
    login_back: 'Voltar para opções',
    login_disclaimer: 'Acceso instantáneo sin contraseña para el plan gratuito.',

    privacy_title: 'Términos de Uso y Privacidad',
    privacy_subtitle: 'Transparencia total con tu información e historial profesional',
    privacy_sec_1_title: '1. Tus Datos Son Estrictamente Tuyos',
    privacy_sec_1_desc: 'CURRÊ no vende, no comercializa y no comparte tu información personal, contactos o historiales profesionales con terceras empresas con fines publicitarios.',
    privacy_sec_2_title: '2. No Solicitamos Documentos Confidenciales',
    privacy_sec_2_desc: 'En cumplimiento con las buenas prácticas de seguridad, nunca solicitamos números de documentos confidenciales como pasaportes, identificaciones, licencias o datos bancarios.',
    privacy_sec_3_title: '3. Inteligência Artificial Responsável',
    privacy_sec_3_desc: 'Los textos ingresados se procesan de forma segura exclusivamente para mejorar la redacción de tu currículum y compararlo con los requisitos de la vacante deseada. La IA no inventa datos y trabaja como asistente de redacción profesional.',
    privacy_sec_4_title: '4. Almacenamiento y Eliminación',
    privacy_sec_4_desc: 'Tus currículos se guardan en tu propio navegador y, si utilizas el inicio de sesión opcional, se asocian de forma segura a tu cuenta. Puedes borrar los datos del navegador en cualquier momento.',
    privacy_understand: 'Entendido y Cerrar'
  },
  fr: {
    how_it_works_title: 'Comment fonctionne CURRÊ ?',
    how_it_works_subtitle: 'Poursuivez le bon travail en seulement 3 étapes simples',
    step_1_title: 'Remplissez vos informations',
    step_1_desc: 'Saisissez vos coordonnées, votre formation et vos expériences. Ne vous souciez pas d\'utiliser des mots difficiles — décrivez votre routine avec vos propres mots.',
    step_2_title: 'Collez l\'offre d\'emploi souhaitée (facultatif)',
    step_2_desc: 'L\'IA analyse les exigences et les mots-clés de l\'offre pour mettre en valeur vos expériences et qualifications réelles les plus compatibles.',
    step_3_title: 'Recevez votre CV en PDF',
    step_3_desc: 'Prêt à être envoyé ! Dans un format professionnel approuvé par les recruteurs et prêt à être imprimé ou envoyé par e-mail et WhatsApp.',
    how_it_works_ethics: 'L\'IA de CURRÊ n\'invente jamais de fausses expériences. Elle ne fait que valoriser votre histoire réelle.',
    how_it_works_btn: 'CRÉER MON CV MAINTENANT',
    
    features_title: 'Fonctionnalités de CURRÊ',
    features_subtitle: 'Technologie conçue pour votre croissance professionnelle',
    feat_1_title: 'Raffinement de la Rédaction',
    feat_1_desc: 'Convertit des phrases simples en puces d\'action à fort impact reconnues lors des sélections.',
    feat_2_title: 'Lecteur d\'Offres Intelligent',
    feat_2_desc: 'Extrait les compétences clés de l\'offre et positionne votre profil avec une pertinence maximale.',
    feat_3_title: 'Norme ATS Épurée',
    feat_3_desc: 'Formaté pour passer sans erreur les robots de tri (Gupy, Kenoby, LinkedIn).',
    feat_4_title: 'Confidentialité Totale',
    feat_4_desc: 'Nous ne demandons pas de documents confidentiels comme des numéros d\'identification ou des cartes d\'identité. Vos données vous appartiennent.',
    close_btn: 'Fermer',

    login_active_title: 'Cloud Connecté et Actif',
    login_active_desc: 'Vos CV générés lors de cette session sont liés à votre compte et protégés pour un accès ultérieur.',
    login_active_continue: 'Continuer à utiliser CURRÊ',
    login_active_logout: 'Se Déconnecter',
    login_title: 'Sauvegarder dans le Cloud (Optionnel)',
    login_subtitle: 'Accédez à vos CV depuis n\'importe quel ordinateur ou téléphone',
    login_opt_title: 'Connexion 100% Optionnelle',
    login_opt_desc: 'Vous pouvez créer et télécharger des CV sans vous connecter. Le compte sert uniquement à synchroniser vos données dans le cloud pour ne jamais les perdre.',
    login_google: 'Continuer avec Google',
    login_google_loading: 'Connexion...',
    login_or_email: 'ou par e-mail',
    login_email_btn: 'Se connecter par e-mail',
    login_skip: 'Continuer sans connexion (Sauvegarder uniquement dans le navigateur)',
    login_name_label: 'Votre Nom (optionnel)',
    login_name_ph: 'ex: Jean Dupont',
    login_email_label: 'Votre E-mail *',
    login_email_ph: 'ex: votreemail@gmail.com',
    login_submit_email: 'Accéder au Compte et Activer le Cloud',
    login_submit_email_loading: 'Synchronisation...',
    login_back: 'Retour aux options',
    login_disclaimer: 'Accès instantané sans mot de passe pour le plan gratuit.',

    privacy_title: 'Conditions d\'Utilisation et Confidentialité',
    privacy_subtitle: 'Transparence totale avec vos informations et votre historique professionnel',
    privacy_sec_1_title: '1. Vos Données Sont Strictement les Vôtres',
    privacy_sec_1_desc: 'CURRÊ ne vend, ne commerce et ne partage pas vos informations personnelles, vos contacts ou vos antécédents professionnels avec des tiers à des fins publicitaires.',
    privacy_sec_2_title: '2. Nous ne Demandons Pas de Documents Confidentiels',
    privacy_sec_2_desc: 'Conformément aux bonnes pratiques de sécurité, nous ne demandons jamais de numéros de documents confidentiels tels que des pièces d\'identité, passeports ou coordonnées bancaires.',
    privacy_sec_3_title: '3. Intelligence Artificielle Responsable',
    privacy_sec_3_desc: 'Les textes saisis sont traités de manière sécurisée exclusivement pour améliorer la rédaction de votre CV et le faire correspondre aux exigences de l\'offre d\'emploi. L\'IA n\'invente pas de données et fonctionne comme un assistant de rédaction professionnel.',
    privacy_sec_4_title: '4. Stockage et Suppression',
    privacy_sec_4_desc: 'Vos CV sont stockés dans votre propre navigateur et, si vous utilisez la connexion optionnelle, sont associés en toute sécurité à votre compte. Vous pouvez effacer les données de votre navigateur à tout moment.',
    privacy_understand: 'Compris et Fermer'
  }
};

export const HowItWorksModal: React.FC<ModalProps & { onStart: () => void }> = ({ isOpen, onClose, onStart }) => {
  const { language } = useLanguage();
  const text = MODAL_T[language] || MODAL_T.pt;

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
            <h2 className="text-xl font-bold text-slate-900">{text.how_it_works_title}</h2>
            <p className="text-xs text-slate-500">{text.how_it_works_subtitle}</p>
          </div>
        </div>

        <div className="space-y-4 my-6">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/70 border border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-sky-600 text-white font-extrabold flex items-center justify-center shrink-0 text-sm">
              1
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{text.step_1_title}</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {text.step_1_desc}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/70 border border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white font-extrabold flex items-center justify-center shrink-0 text-sm">
              2
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{text.step_2_title}</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {text.step_2_desc}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/70 border border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center shrink-0 text-sm">
              3
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{text.step_3_title}</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {text.step_3_desc}
              </p>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-100 text-xs text-sky-800 flex items-center gap-2 mb-6">
          <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
          <span>{text.how_it_works_ethics}</span>
        </div>

        <button
          onClick={() => {
            onClose();
            onStart();
          }}
          className="w-full liquid-glass-button text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-sky-500/30"
        >
          <span>{text.how_it_works_btn}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const FeaturesModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const text = MODAL_T[language] || MODAL_T.pt;

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
            <h2 className="text-xl font-bold text-slate-900">{text.features_title}</h2>
            <p className="text-xs text-slate-500">{text.features_subtitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-5">
          <div className="p-4 rounded-2xl bg-white/70 border border-slate-100">
            <Sparkles className="w-5 h-5 text-sky-600 mb-2" />
            <h4 className="font-bold text-slate-900 text-sm">{text.feat_1_title}</h4>
            <p className="text-xs text-slate-600 mt-1">
              {text.feat_1_desc}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 border border-slate-100">
            <Zap className="w-5 h-5 text-cyan-600 mb-2" />
            <h4 className="font-bold text-slate-900 text-sm">{text.feat_2_title}</h4>
            <p className="text-xs text-slate-600 mt-1">
              {text.feat_2_desc}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 border border-slate-100">
            <FileCheck className="w-5 h-5 text-blue-600 mb-2" />
            <h4 className="font-bold text-slate-900 text-sm">{text.feat_3_title}</h4>
            <p className="text-xs text-slate-600 mt-1">
              {text.feat_3_desc}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 border border-slate-100">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mb-2" />
            <h4 className="font-bold text-slate-900 text-sm">{text.feat_4_title}</h4>
            <p className="text-xs text-slate-600 mt-1">
              {text.feat_4_desc}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
        >
          {text.close_btn}
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
  const { language } = useLanguage();
  const text = MODAL_T[language] || MODAL_T.pt;

  if (!isOpen) return null;

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const user: UserProfile = {
        id: 'usr_' + Date.now(),
        name: language === 'pt' ? 'Usuário Google' : 'Google User',
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
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-sky-500/30 text-lg font-bold">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{currentUser.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{currentUser.email}</p>

            <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold mb-1">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{text.login_active_title}</span>
              </div>
              <p className="text-xs text-slate-600">
                {text.login_active_desc}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={onClose}
                className="w-full liquid-glass-button text-white font-bold py-3 rounded-xl text-sm shadow-md shadow-sky-500/25 cursor-pointer"
              >
                {text.login_active_continue}
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
                  <span>{text.login_active_logout}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-sky-500/30">
                <Cloud className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{text.login_title}</h2>
              <p className="text-xs text-slate-500 mt-1">
                {text.login_subtitle}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-100 mb-5 text-left">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>{text.login_opt_title}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed text-[11px]">
                {text.login_opt_desc}
              </p>
            </div>

            {mode === 'main' ? (
              <div className="space-y-3">
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
                  <span>{loading ? text.login_google_loading : text.login_google}</span>
                </button>

                <div className="flex items-center my-3">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{text.login_or_email}</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <button
                  onClick={() => setMode('email')}
                  id="login-btn-email-mode"
                  className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span>{text.login_email_btn}</span>
                </button>

                <div className="pt-2">
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                  >
                    {text.login_skip}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEmailLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{text.login_name_label}</label>
                  <input
                    type="text"
                    placeholder={text.login_name_ph}
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{text.login_email_label}</label>
                  <input
                    type="email"
                    required
                    placeholder={text.login_email_ph}
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
                  {loading ? text.login_submit_email_loading : text.login_submit_email}
                </button>

                <button
                  type="button"
                  onClick={() => setMode('main')}
                  className="w-full py-1 text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer text-center"
                >
                  {text.login_back}
                </button>
              </form>
            )}

            <p className="text-center text-[10px] text-slate-400 mt-4 leading-tight">
              {text.login_disclaimer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const PrivacyTermsModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const text = MODAL_T[language] || MODAL_T.pt;

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
            <h2 className="text-xl font-bold text-slate-900">{text.privacy_title}</h2>
            <p className="text-xs text-slate-500">{text.privacy_subtitle}</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-600 leading-relaxed my-5 pr-1">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
            <h4 className="font-bold text-slate-900 text-xs mb-1">{text.privacy_sec_1_title}</h4>
            <p>
              {text.privacy_sec_1_desc}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
            <h4 className="font-bold text-slate-900 text-xs mb-1">{text.privacy_sec_2_title}</h4>
            <p>
              {text.privacy_sec_2_desc}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
            <h4 className="font-bold text-slate-900 text-xs mb-1">{text.privacy_sec_3_title}</h4>
            <p>
              {text.privacy_sec_3_desc}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
            <h4 className="font-bold text-slate-900 text-xs mb-1">{text.privacy_sec_4_title}</h4>
            <p>
              {text.privacy_sec_4_desc}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
        >
          {text.privacy_understand}
        </button>
      </div>
    </div>
  );
};
