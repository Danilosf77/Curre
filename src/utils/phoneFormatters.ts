import { Language } from '../i18n/LanguageContext';

export interface CountryPhoneConfig {
  countryCode: string;
  countryName: string;
  formatLabel: string;
  placeholder: string;
  example: string;
  errorMessage: string;
  maxLength: number;
  format: (value: string) => string;
  isValid: (value: string) => boolean;
}

export const PHONE_CONFIGS: Record<Language, CountryPhoneConfig> = {
  pt: {
    countryCode: '+55',
    countryName: 'Brasil',
    formatLabel: 'Padrão: (11) 98765-4321',
    placeholder: '(11) 98765-4321',
    example: '(11) 9 8765-4321',
    errorMessage: 'Informe um telefone ou WhatsApp completo no formato (xx) 9xxxx-xxxx.',
    maxLength: 18,
    format: (value: string): string => {
      if (value.startsWith('+')) {
        return value;
      }
      let clean = value.replace(/\D/g, '');
      if (clean.startsWith('55') && clean.length > 11) {
        clean = clean.slice(2);
      }
      const digits = clean.slice(0, 11);
      if (!digits) return '';
      if (digits.length <= 2) return `(${digits}`;
      if (digits.length <= 3) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3)}`;
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
    },
    isValid: (value: string): boolean => {
      const clean = value.replace(/\D/g, '');
      return clean.length >= 10 && clean.length <= 13;
    },
  },

  fr: {
    countryCode: '+33',
    countryName: 'France',
    formatLabel: 'Format : 06 12 34 56 78 ou +33 6 12 34 56 78',
    placeholder: '06 12 34 56 78',
    example: '06 12 34 56 78',
    errorMessage: 'Indiquez un numéro de téléphone valide (ex: 06 12 34 56 78 ou +33 6 12 34 56 78).',
    maxLength: 20,
    format: (value: string): string => {
      if (value.startsWith('+')) {
        const clean = value.replace(/[^\d+]/g, '');
        if (clean.startsWith('+33')) {
          const rest = clean.slice(3).replace(/\D/g, '').slice(0, 9);
          if (!rest) return '+33';
          const parts = [rest.slice(0, 1)];
          for (let i = 1; i < rest.length; i += 2) {
            parts.push(rest.slice(i, i + 2));
          }
          return `+33 ${parts.filter(Boolean).join(' ')}`;
        }
        return value;
      }
      // Format classique français par paires de 2 chiffres : 06 12 34 56 78
      const digits = value.replace(/\D/g, '').slice(0, 10);
      if (!digits) return '';
      const groups: string[] = [];
      for (let i = 0; i < digits.length; i += 2) {
        groups.push(digits.slice(i, i + 2));
      }
      return groups.join(' ');
    },
    isValid: (value: string): boolean => {
      const clean = value.replace(/\D/g, '');
      return clean.length >= 9 && clean.length <= 12;
    },
  },

  en: {
    countryCode: '+1',
    countryName: 'United States',
    formatLabel: 'Format: (555) 123-4567 or +1 (555) 123-4567',
    placeholder: '(555) 123-4567',
    example: '(555) 123-4567',
    errorMessage: 'Enter a valid phone number, e.g. (555) 123-4567.',
    maxLength: 20,
    format: (value: string): string => {
      if (value.startsWith('+1')) {
        const digits = value.slice(2).replace(/\D/g, '').slice(0, 10);
        if (!digits) return '+1';
        if (digits.length <= 3) return `+1 (${digits}`;
        if (digits.length <= 6) return `+1 (${digits.slice(0, 3)}) ${digits.slice(3)}`;
        return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
      }
      if (value.startsWith('+')) {
        return value;
      }
      const digits = value.replace(/\D/g, '').slice(0, 10);
      if (!digits) return '';
      if (digits.length <= 3) return `(${digits}`;
      if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    },
    isValid: (value: string): boolean => {
      const clean = value.replace(/\D/g, '');
      return clean.length >= 10 && clean.length <= 11;
    },
  },

  es: {
    countryCode: '+34',
    countryName: 'España',
    formatLabel: 'Formato: 612 345 678 o +34 612 345 678',
    placeholder: '612 345 678',
    example: '612 345 678',
    errorMessage: 'Introduce un número válido como 612 345 678 o +34 612 345 678.',
    maxLength: 20,
    format: (value: string): string => {
      if (value.startsWith('+34')) {
        const digits = value.slice(3).replace(/\D/g, '').slice(0, 9);
        if (!digits) return '+34';
        if (digits.length <= 3) return `+34 ${digits}`;
        if (digits.length <= 6) return `+34 ${digits.slice(0, 3)} ${digits.slice(3)}`;
        return `+34 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
      }
      if (value.startsWith('+')) {
        return value;
      }
      const digits = value.replace(/\D/g, '').slice(0, 9);
      if (!digits) return '';
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
    },
    isValid: (value: string): boolean => {
      const clean = value.replace(/\D/g, '');
      return clean.length >= 9 && clean.length <= 11;
    },
  },
};

export const getPhoneConfig = (lang: Language): CountryPhoneConfig => {
  return PHONE_CONFIGS[lang] || PHONE_CONFIGS.pt;
};
