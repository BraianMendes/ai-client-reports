'use client';

import { Spinner } from '@heroui/react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  label?: string;
  fullScreen?: boolean;
  className?: string;
}

export default function Loading({ 
  size = 'md', 
  color = 'primary', 
  label = 'Loading...', 
  fullScreen = false,
  className = ''
}: LoadingProps) {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Spinner size={size} color={color} />
      {label && (
        <p className="text-sm text-neutral-400 animate-pulse">
          {label}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-neutral-900 p-8 rounded-xl border border-neutral-800">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
