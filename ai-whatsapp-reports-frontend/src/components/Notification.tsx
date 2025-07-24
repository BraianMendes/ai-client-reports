'use client';

import { useEffect } from 'react';
import { NotificationProps } from '@/types';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface NotificationComponentProps extends NotificationProps {
  onClose?: () => void;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colorMap = {
  success: 'border-green-500 bg-green-50 text-green-800',
  error: 'border-red-500 bg-red-50 text-red-800',
  warning: 'border-yellow-500 bg-yellow-50 text-yellow-800',
  info: 'border-blue-500 bg-blue-50 text-blue-800',
};

const iconColorMap = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

export default function Notification({ 
  type, 
  message, 
  duration = 3000, 
  onClose 
}: NotificationComponentProps) {
  const Icon = iconMap[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`
      fixed top-4 right-4 z-50
      min-w-[300px] max-w-[500px]
      border-l-4 p-4 rounded-lg shadow-lg
      flex items-start gap-3
      animate-in slide-in-from-right-5 duration-300
      ${colorMap[type]}
    `}>
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColorMap[type]}`} />
      
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-black/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
