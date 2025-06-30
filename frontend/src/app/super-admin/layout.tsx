'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !user) {
        router.push('/auth/login?redirect=/super-admin');
        return;
      }
      
      if (user.role?.slug !== 'admin') {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role?.slug !== 'admin') {
    return null;
  }

  // Admin có layout riêng, không sử dụng header chung
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
