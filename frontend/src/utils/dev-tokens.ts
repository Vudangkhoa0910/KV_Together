// Script to set admin token in localStorage for testing
// Run this in browser console: localStorage.setItem('token', '4|oY1ozwa7jvCqo1XfTpPoJjyVLs1GuZ8Q7zOBZMk18cdc2a63');

export const ADMIN_TOKEN = '20|XxLZEbq16jgraGTzWbSJEPsaRrcrGXZR49uzjMwD163c0af2';

export const ADMIN_USER = {
  id: 1,
  name: "Khoa Admin",
  email: "admin@kvtogether.com",
  phone: "0123456789",
  role: {
    id: 1,
    name: "Admin",
    slug: "admin"
  },
  status: "active",
  created_at: "2025-05-27T18:03:19.000000Z"
};

// Helper function to set token for development
export const setAdminToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', ADMIN_TOKEN);
    
    // Set user info in cookies
    import('js-cookie').then(({ default: Cookies }) => {
      Cookies.set('user', JSON.stringify(ADMIN_USER), { 
        expires: 7, 
        secure: false, 
        sameSite: 'lax'
      });
      Cookies.set('token_last_validated', Date.now().toString(), { expires: 7 });
    });
    
    // Also set token in axios instance immediately
    import('@/lib/axios').then(({ default: axiosInstance }) => {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${ADMIN_TOKEN}`;
    });
    
    console.log('Admin token set for testing');
  }
};
