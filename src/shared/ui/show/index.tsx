import React from 'react';

interface ShowProps {
  when: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Show({ when, children, fallback }: ShowProps) {
  if (when) {
    return <>{children}</>;
  }
  
  return fallback ? <>{fallback}</> : null;
}