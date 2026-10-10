import { Instagram } from 'lucide-react';
import { trackEvent } from '../utils/analytics';
export const INSTAGRAM_URL = 'https://www.instagram.com/curreai/';
export function InstagramLink({ placement }: { placement: 'footer' | 'contact_page' }) {
 return <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram CURRÊ @curreAI" onClick={() => trackEvent('instagram_click', { placement })} className="inline-flex min-h-11 items-center gap-2 rounded-lg hover:text-sky-600 dark:hover:text-sky-300 focus-visible:outline-2 focus-visible:outline-sky-600 focus-visible:outline-offset-4"><Instagram size={18} aria-hidden="true"/>@curreAI</a>;
}
