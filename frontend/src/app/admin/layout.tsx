'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
<<<<<<< HEAD
=======
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import DevTokenSetter from '@/components/DevTokenSetter';
>>>>>>> origin/main

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !user) {
<<<<<<< HEAD
        router.push('/auth/login?redirect=/super-admin');
=======
        router.push('/auth/login');
>>>>>>> origin/main
        return;
      }
      
      if (user.role?.slug !== 'admin') {
        router.push('/unauthorized');
        return;
      }
<<<<<<< HEAD

      // Redirect to new super admin dashboard
      router.push('/super-admin');
=======
>>>>>>> origin/main
    }
  }, [user, isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

<<<<<<< HEAD
  // This admin route is deprecated - redirect to super-admin
  return null;
=======
  if (!isAuthenticated || !user || user.role?.slug !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Development token setter */}
      <DevTokenSetter />
      
      {/* Admin Sidebar */}
      <AdminSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Admin Header */}
        <AdminHeader />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
>>>>>>> origin/main
}
