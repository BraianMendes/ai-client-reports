'use client';

import { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
  full: 'max-w-full'
};

export default function PageLayout({
  children,
  title,
  description,
  className = '',
  maxWidth = '4xl'
}: PageLayoutProps) {
  return (
    <div className={`min-h-screen w-full bg-black flex flex-col p-4 md:p-8 ${className}`}>
      <div className={`w-full ${maxWidthClasses[maxWidth]} mx-auto flex flex-col flex-1 mt-16`}>
        {(title || description) && (
          <div className="mb-8">
            {title && (
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-neutral-400 text-lg">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
