import React from 'react';

interface ContactItemProps {
  icon: React.ReactNode;
  text: string;
  href?: string;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

/**
 * Deterministic Contact Item Component
 * 
 * Formatted mathematically to guarantee identical visual rendering in both
 * standard browser DOM and html2canvas canvas extraction for PDF generation.
 * Eliminates baseline shifts and font glyph ascender/descender discrepancies.
 */
export const ContactItem: React.FC<ContactItemProps> = ({
  icon,
  text,
  href,
  className = '',
  iconClassName = '',
  textClassName = '',
}) => {
  if (!text) return null;

  const inner = (
    <span className={`contact-item inline-flex items-center gap-1.5 align-middle ${className}`}>
      <span className={`contact-icon inline-flex items-center justify-center shrink-0 w-3.5 h-3.5 ${iconClassName}`}>
        {icon}
      </span>
      <span className={`contact-text inline-block align-middle leading-tight ${textClassName}`}>
        {text}
      </span>
    </span>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-inherit hover:underline inline-flex items-center focus:outline-none"
      >
        {inner}
      </a>
    );
  }

  return inner;
};
