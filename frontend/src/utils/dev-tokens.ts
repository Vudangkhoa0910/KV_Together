// Script to set admin token in localStorage for testing
// Run this in browser console: localStorage.setItem('token', '4|oY1ozwa7jvCqo1XfTpPoJjyVLs1GuZ8Q7zOBZMk18cdc2a63');

export const ADMIN_TOKEN = '8|K9jyt0cKdUqcgpZUOjB6MMUdUkZc23NI5tC9KpUFa29387fc';

// Helper function to set token for development
export const setAdminToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', ADMIN_TOKEN);
    console.log('Admin token set for testing');
  }
};
