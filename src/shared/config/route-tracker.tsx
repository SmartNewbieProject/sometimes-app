import { useEffect, ReactNode } from 'react';
import { usePathname, useSegments } from 'expo-router';
import { storage } from '@/src/shared/libs/store';

interface RouteTrackerProps {
  children: ReactNode;
}

export function RouteTracker({ children }: RouteTrackerProps) {
  const pathname = usePathname();
  const segments = useSegments();

  useEffect(() => {
    const saveCurrentPath = async () => {
      try {
        await storage.setItem('current-path', pathname);
      } catch (error) {
        console.error('Failed to save current path:', error);
      }
    };

    saveCurrentPath();
  }, [pathname, segments]);

  return children;
}
