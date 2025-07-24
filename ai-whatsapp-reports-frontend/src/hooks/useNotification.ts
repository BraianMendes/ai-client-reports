import { useState, useCallback } from 'react';
import { NotificationProps } from '@/types';
import { NOTIFICATION_DURATION } from '@/constants';

interface UseNotificationReturn {
  notification: NotificationProps | null;
  showNotification: (type: NotificationProps['type'], message: string, duration?: number) => void;
  hideNotification: () => void;
}

export const useNotification = (): UseNotificationReturn => {
  const [notification, setNotification] = useState<NotificationProps | null>(null);

  const showNotification = useCallback((
    type: NotificationProps['type'], 
    message: string, 
    duration: number = NOTIFICATION_DURATION
  ) => {
    setNotification({ type, message, duration });
    
    setTimeout(() => {
      setNotification(null);
    }, duration);
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return {
    notification,
    showNotification,
    hideNotification
  };
};
