import { useEffect, type ReactNode } from 'react';
import { usePathname, useSegments } from 'expo-router';
import { storage } from '@/src/shared/libs/store';
import { Text } from '../ui';

interface RouteTrackerProps {
  children: ReactNode;
}

export function RouteTracker({ children }: RouteTrackerProps) {
  const pathname = usePathname();
  const segments = useSegments();

  useEffect(() => {
    const saveCurrentPath = async () => {
      try {
        const current = await storage.getItem('current-path');
        await storage.setItem('previous-path', current ?? '/');
        await storage.setItem('current-path', pathname);
      } catch (error) {
        console.error('Failed to save current path:', error);
      }
    };

    saveCurrentPath();
  }, [pathname, segments]);

  if (typeof children === 'string') {
    return <Text>{children}</Text>;
  }

  return children;
}
