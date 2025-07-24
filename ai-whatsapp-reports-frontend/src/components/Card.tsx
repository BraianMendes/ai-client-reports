'use client';

import { ReactNode } from 'react';
import { Card as HeroCard, CardHeader, CardBody } from '@heroui/react';

interface CardProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  className = '',
  header,
  title,
  subtitle,
  icon: Icon,
  hoverable = false,
  clickable = false,
  onClick
}: CardProps) {
  const baseClasses = `
    bg-neutral-900 
    border border-neutral-800 
    rounded-2xl 
    shadow-md
    ${hoverable || clickable ? 'hover:border-blue-400/40 transition-all duration-200' : ''}
    ${clickable ? 'cursor-pointer hover:shadow-lg' : ''}
    ${className}
  `;

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  return (
    <HeroCard 
      className={baseClasses}
      onClick={handleClick}
    >
      {(header || title || subtitle || Icon) && (
        <CardHeader className="flex flex-col items-center">
          {Icon && <Icon className="w-10 h-10 text-blue-400 mb-2" />}
          {title && (
            <h3 className="text-xl font-semibold text-white text-center">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-neutral-400 text-center mt-1">
              {subtitle}
            </p>
          )}
          {header}
        </CardHeader>
      )}
      
      <CardBody className="px-6 pb-6">
        {children}
      </CardBody>
    </HeroCard>
  );
}
