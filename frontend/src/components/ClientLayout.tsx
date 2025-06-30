'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { AdminViewProvider } from '@/contexts/AdminViewContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminView } from '@/contexts/AdminViewContext';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminViewToggle from '@/components/admin/AdminViewToggle';

function AppContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { isViewAsUser } = useAdminView();
  const pathname = usePathname();
  
<<<<<<< HEAD
  // Check if we're on an admin route (including super-admin)
  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/super-admin');
  
  // For admin routes, always use admin layout regardless of view mode
  // The view toggle should only affect the UI styling, not the layout
  if (isAdminRoute) {
    return (
      <>
        {children}
        {user?.role?.slug === 'admin' && !pathname?.startsWith('/super-admin') && <AdminViewToggle />}
=======
  // Check if we're on an admin route
  const isAdminRoute = pathname?.startsWith('/admin');
  
  // If admin is viewing as user, or not on admin route, show regular layout
  const showRegularLayout = !isAdminRoute || (user?.role?.slug === 'admin' && isViewAsUser);
  
  if (showRegularLayout) {
    return (
      <>
        <Header />
        <main className="main-content">
          {children}
        </main>
        <Footer />
        {/* Show toggle button for admin users */}
        {user?.role?.slug === 'admin' && <AdminViewToggle />}
>>>>>>> origin/main
      </>
    );
  }
  
<<<<<<< HEAD
  // For non-admin routes, show regular layout
  return (
    <>
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
      {/* Show toggle button for admin users */}
=======
  // For admin routes without "view as user" mode, show children directly
  // (AdminLayout will handle the layout)
  return (
    <>
      {children}
>>>>>>> origin/main
      {user?.role?.slug === 'admin' && <AdminViewToggle />}
    </>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminViewProvider>
        <AppContent>
          {children}
        </AppContent>
      </AdminViewProvider>
    </AuthProvider>
  );
}
