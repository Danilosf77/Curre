import type { TemplateStyle } from '../types';

export type TemplateCategory = 'modern' | 'classic' | 'ats' | 'creative';
export const RESUME_TEMPLATES: Array<{ id: TemplateStyle; name: string; key: string; category: TemplateCategory }> = [
  { id: 'liquid-modern', name: 'Modern Clean', key: 'modern', category: 'modern' },
  { id: 'executive-clean', name: 'Executive', key: 'executive', category: 'classic' },
  { id: 'ats-professional', name: 'ATS Professional', key: 'ats', category: 'ats' },
  { id: 'impact', name: 'Impact', key: 'impact', category: 'creative' },
  { id: 'corporate-premium', name: 'Corporate Premium', key: 'corporate', category: 'classic' },
  { id: 'minimalist', name: 'Soft Sidebar', key: 'minimalist', category: 'modern' },
  { id: 'creative-color', name: 'Creative Pop', key: 'creative', category: 'creative' },
  { id: 'elegant-serif', name: 'Elegant Serif', key: 'elegant', category: 'classic' },
  { id: 'timeline-tech', name: 'Timeline Tech', key: 'tech', category: 'modern' },
  { id: 'international', name: 'International', key: 'intl', category: 'ats' },
];

const labels = {
  pt: { title: 'Escolha o visual do seu currículo', subtitle: 'Toque em um modelo para ver seu currículo nesse visual.', change: 'Escolher outro modelo', style: 'Estilo atual', apply: 'Usar este modelo', cancel: 'Cancelar', close: 'Fechar galeria', selected: 'Selecionado', models: 'modelos', all: 'Todos', modern: 'Modernos', classic: 'Clássicos', ats: 'ATS', creative: 'Criativos', cloud: 'Acesse seu currículo em outros dispositivos.', save: 'Salvar na nuvem' },
  en: { title: 'Choose your resume template', subtitle: 'Select a template to preview your resume.', change: 'Change template', style: 'Current style', apply: 'Use this template', cancel: 'Cancel', close: 'Close gallery', selected: 'Selected', models: 'templates', all: 'All', modern: 'Modern', classic: 'Classic', ats: 'ATS', creative: 'Creative', cloud: 'Access your resume on other devices.', save: 'Save to cloud' },
  es: { title: 'Elige el modelo del currículum', subtitle: 'Toca un modelo para ver tu currículum.', change: 'Cambiar modelo', style: 'Estilo actual', apply: 'Usar este modelo', cancel: 'Cancelar', close: 'Cerrar galería', selected: 'Seleccionado', models: 'modelos', all: 'Todos', modern: 'Modernos', classic: 'Clásicos', ats: 'ATS', creative: 'Creativos', cloud: 'Accede a tu currículum en otros dispositivos.', save: 'Guardar en la nube' },
  fr: { title: 'Choisissez votre modèle de CV', subtitle: 'Sélectionnez un modèle pour voir votre CV.', change: 'Changer de modèle', style: 'Style actuel', apply: 'Utiliser ce modèle', cancel: 'Annuler', close: 'Fermer la galerie', selected: 'Sélectionné', models: 'modèles', all: 'Tous', modern: 'Modernes', classic: 'Classiques', ats: 'ATS', creative: 'Créatifs', cloud: 'Accédez à votre CV sur vos autres appareils.', save: 'Enregistrer dans le cloud' },
};
export const galleryLabels = (language: string) => labels[language as keyof typeof labels] || labels.pt;
