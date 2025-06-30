'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useAdminView } from '@/contexts/AdminViewContext';
import { usePathname } from 'next/navigation';

export default function AdminDebugInfo() {
  const { user, isAuthenticated } = useAuth();
  const { isViewAsUser } = useAdminView();
  const pathname = usePathname();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Only show for admin users
  if (user?.role?.slug !== 'admin') {
    return null;
  }

  return (
    <div className="fixed top-20 left-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs z-50">
      <div>Path: {pathname}</div>
      <div>Auth: {isAuthenticated ? 'Yes' : 'No'}</div>
      <div>User: {user?.name} ({user?.role?.slug})</div>
      <div>View Mode: {isViewAsUser ? 'User' : 'Admin'}</div>
    </div>
  );
}
