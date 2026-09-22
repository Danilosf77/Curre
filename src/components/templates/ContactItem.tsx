import React from 'react';

interface ContactItemProps {
  icon: React.ReactNode;
  text: string;
  href?: string;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

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
    <span className={`contact-item inline-flex items-center gap-1.5 ${className}`}>
      <span className={`contact-icon inline-flex items-center justify-center shrink-0 ${iconClassName}`}>
        {icon}
      </span>
      <span className={`contact-text ${textClassName}`}>
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
        className="text-inherit hover:underline inline-flex items-center"
      >
        {inner}
      </a>
    );
  }

  return inner;
};
