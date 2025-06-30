'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useAdminView } from '@/contexts/AdminViewContext';
import { useRouter } from 'next/navigation';

export default function AdminViewToggle() {
  const { user } = useAuth();
  const { isViewAsUser, toggleViewAsUser } = useAdminView();
  const router = useRouter();

  // Only show for admin users
  if (user?.role?.slug !== 'admin') {
    return null;
  }

  const handleToggle = () => {
    if (isViewAsUser) {
<<<<<<< HEAD
      // Going back to admin view - just toggle, don't redirect
      toggleViewAsUser();
    } else {
      // Going to user view - toggle but stay on current page to preview as user
      toggleViewAsUser();
=======
      // Going back to admin view
      toggleViewAsUser();
      router.push('/admin');
    } else {
      // Going to user view
      toggleViewAsUser();
      router.push('/');
>>>>>>> origin/main
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handleToggle}
        className={`
          flex items-center px-4 py-2 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl
          ${isViewAsUser 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-gray-800 text-white hover:bg-gray-900'
          }
        `}
      >
        {isViewAsUser ? (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Về trang Admin
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Xem như User
          </>
        )}
      </button>
    </div>
  );
}
