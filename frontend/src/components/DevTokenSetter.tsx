'use client';

import { useEffect } from 'react';
import { setAdminToken } from '@/utils/dev-tokens';

export default function DevTokenSetter() {
  useEffect(() => {
    // Only set token in development
    if (process.env.NODE_ENV === 'development') {
      setAdminToken();
    }
  }, []);

  // This component doesn't render anything
  return null;
}
