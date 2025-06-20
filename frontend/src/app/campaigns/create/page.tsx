'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * This component redirects the user to the main campaign creation page
 * Helps maintain a single source of truth for campaign creation
 */
const CreateCampaignRedirect = () => {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();
  
  useEffect(() => {
    // If authentication isn't loaded yet, wait
    if (isLoading) return;
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/fundraiser/campaigns/create');
      return;
    }
    
    // Check if user has the right role to create campaigns
    if (user?.role?.slug !== 'fundraiser') {
      router.push('/auth/access-denied?message=Bạn cần có tài khoản fundraiser để tạo chiến dịch');
      return;
    }
    
    // Redirect to the main campaign creation page
    router.push('/fundraiser/campaigns/create');
  }, [isAuthenticated, isLoading, user, router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner message="Đang chuyển hướng đến trang tạo chiến dịch..." />
    </div>
  );
};

export default CreateCampaignRedirect; 