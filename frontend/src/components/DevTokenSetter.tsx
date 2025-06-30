'use client';

import { useEffect } from 'react';
<<<<<<< HEAD
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_TOKEN, ADMIN_USER } from '@/utils/dev-tokens';

export default function DevTokenSetter() {
  const { setDevAuth } = useAuth();

  useEffect(() => {
    // Only set token in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Setting dev admin auth...');
      setDevAuth(ADMIN_USER, ADMIN_TOKEN);
    }
  }, [setDevAuth]);
=======
import { setAdminToken } from '@/utils/dev-tokens';

export default function DevTokenSetter() {
  useEffect(() => {
    // Only set token in development
    if (process.env.NODE_ENV === 'development') {
      setAdminToken();
    }
  }, []);
>>>>>>> origin/main

  // This component doesn't render anything
  return null;
}
