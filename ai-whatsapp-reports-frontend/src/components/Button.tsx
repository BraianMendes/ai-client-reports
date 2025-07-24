'use client';

import { Button as HeroButton, ButtonProps as HeroButtonProps } from '@heroui/react';
import { ReactNode } from 'react';
import { Spinner } from '@heroui/react';

interface CustomButtonProps extends Omit<HeroButtonProps, 'children'> {
  children: ReactNode;
  loading?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
}

export default function Button({
  children,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  disabled,
  className = '',
  ...props
}: CustomButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <HeroButton
      {...props}
      disabled={isDisabled}
      className={`
        relative
        ${loading ? 'cursor-wait' : ''}
        ${className}
      `}
    >
      {loading && (
        <Spinner 
          size="sm" 
          className="absolute inset-0 m-auto" 
        />
      )}
      
      <div className={`flex items-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {Icon && iconPosition === 'left' && (
          <Icon className="w-4 h-4" />
        )}
        {children}
        {Icon && iconPosition === 'right' && (
          <Icon className="w-4 h-4" />
        )}
      </div>
    </HeroButton>
  );
}
