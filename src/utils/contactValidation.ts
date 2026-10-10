export const CONTACT_LIMITS = { name: 100, email: 254, subject: 120, message: 5000 };
export type ContactFields = { name: string; email: string; subject: string; message: string };
export function validateContact(value: unknown) {
 const errors: Partial<Record<keyof ContactFields, string>> = {};
 const input = value && typeof value === 'object' ? value as Record<string, unknown> : {};
 const data = {} as ContactFields;
 for (const key of Object.keys(CONTACT_LIMITS) as (keyof ContactFields)[]) {
  const raw = input[key];
  data[key] = typeof raw === 'string' ? raw.normalize('NFC').trim() : '';
  if (!data[key] || data[key].length > CONTACT_LIMITS[key] || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(data[key])) errors[key] = 'invalid';
 }
 for (const key of ['name', 'email', 'subject'] as const) if (/[\r\n]/.test(data[key])) errors[key] = 'invalid';
 if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.email)) errors.email = 'invalid';
 if (data.name.length < 2) errors.name = 'invalid';
 if (data.subject.length < 3) errors.subject = 'invalid';
 if (data.message.length < 10) errors.message = 'invalid';
 return { data, errors, valid: Object.keys(errors).length === 0 };
}
