import type { TemplateStyle } from '../types';

export type TemplateCategory = 'modern' | 'classic' | 'ats' | 'creative';
export const RESUME_TEMPLATES: Array<{ id: TemplateStyle; name: string; key: string; category: TemplateCategory; collection?: 'signature'; badge?: Record<string, string>; description?: Record<string, string> }> = [
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
  { id: 'global-classic', name: 'Global Classic', key: 'global', category: 'ats', collection: 'signature', badge: { pt: 'Candidaturas internacionais', en: 'International applications', es: 'Candidaturas internacionales', fr: 'Candidatures internationales' }, description: { pt: 'Formato clássico, sem foto, com uma coluna e foco na leitura.', en: 'Classic photo-free format with one reading column.', es: 'Formato clásico sin foto y con una columna.', fr: 'Format classique sans photo, sur une colonne.' } },
  { id: 'executive-signature', name: 'Executive Signature', key: 'signature', category: 'classic', collection: 'signature', badge: { pt: 'Liderança e gestão', en: 'Leadership and management', es: 'Liderazgo y gestión', fr: 'Direction et gestion' }, description: { pt: 'Tipografia editorial, azul profundo e detalhes em dourado discreto.', en: 'Editorial typography, deep blue and subtle gold accents.', es: 'Tipografía editorial, azul profundo y detalles dorados.', fr: 'Typographie éditoriale, bleu profond et touches dorées.' } },
  { id: 'nordic', name: 'Nordic', key: 'nordic', category: 'modern', collection: 'signature', badge: { pt: 'Tecnologia e negócios', en: 'Technology and business', es: 'Tecnología y negocios', fr: 'Technologie et affaires' }, description: { pt: 'Design sereno, verde mineral e hierarquia clara para leitura rápida.', en: 'Calm design, mineral green and clear visual hierarchy.', es: 'Diseño sereno, verde mineral y jerarquía clara.', fr: 'Design épuré, vert minéral et hiérarchie claire.' } },
  { id: 'editorial', name: 'Editorial', key: 'editorial', category: 'creative', collection: 'signature', badge: { pt: 'Comunicação e criação', en: 'Communication and creative', es: 'Comunicación y creación', fr: 'Communication et création' }, description: { pt: 'Nome em destaque, contraste de fontes e acento terracota.', en: 'Statement name, contrasting type and terracotta accents.', es: 'Nombre destacado, contraste de fuentes y terracota.', fr: 'Nom mis en valeur, contraste typographique et terre cuite.' } },
];

const labels = {
  pt: { title: 'Escolha o visual do seu currículo', subtitle: 'Toque em um modelo para ver seu currículo nesse visual.', change: 'Escolher outro modelo', style: 'Estilo atual', apply: 'Usar este modelo', cancel: 'Cancelar', close: 'Fechar galeria', selected: 'Selecionado', models: 'modelos', all: 'Todos', modern: 'Modernos', classic: 'Clássicos', ats: 'ATS', creative: 'Criativos', cloud: 'Acesse seu currículo em outros dispositivos.', save: 'Salvar na nuvem', signature: 'Coleção Signature' },
  en: { title: 'Choose your resume template', subtitle: 'Select a template to preview your resume.', change: 'Change template', style: 'Current style', apply: 'Use this template', cancel: 'Cancel', close: 'Close gallery', selected: 'Selected', models: 'templates', all: 'All', modern: 'Modern', classic: 'Classic', ats: 'ATS', creative: 'Creative', cloud: 'Access your resume on other devices.', save: 'Save to cloud', signature: 'Signature collection' },
  es: { title: 'Elige el modelo del currículum', subtitle: 'Toca un modelo para ver tu currículum.', change: 'Cambiar modelo', style: 'Estilo actual', apply: 'Usar este modelo', cancel: 'Cancelar', close: 'Cerrar galería', selected: 'Seleccionado', models: 'modelos', all: 'Todos', modern: 'Modernos', classic: 'Clásicos', ats: 'ATS', creative: 'Creativos', cloud: 'Accede a tu currículum en otros dispositivos.', save: 'Guardar en la nube', signature: 'Colección Signature' },
  fr: { title: 'Choisissez votre modèle de CV', subtitle: 'Sélectionnez un modèle pour voir votre CV.', change: 'Changer de modèle', style: 'Style actuel', apply: 'Utiliser ce modèle', cancel: 'Annuler', close: 'Fermer la galerie', selected: 'Sélectionné', models: 'modèles', all: 'Tous', modern: 'Modernes', classic: 'Classiques', ats: 'ATS', creative: 'Créatifs', cloud: 'Accédez à votre CV sur vos autres appareils.', save: 'Enregistrer dans le cloud', signature: 'Collection Signature' },
};
export const galleryLabels = (language: string) => labels[language as keyof typeof labels] || labels.pt;
