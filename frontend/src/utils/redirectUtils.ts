/**
 * Utility functions for handling redirects safely
 */

/**
 * Creates a safe login redirect URL by ensuring we don't create redirect loops
 * 
 * @param targetPath The path to redirect to after login
 * @returns A safe login URL with proper redirect parameter
 */
export const createSafeLoginRedirect = (targetPath: string): string => {
  // Don't redirect to auth pages or loop back to login
  if (!targetPath || 
      targetPath.includes('/auth/') || 
      targetPath.includes('/login') || 
      targetPath.includes('redirect=')) {
    return '/auth/login';
  }
  
  // Properly encode the redirect URL (only once)
  return `/auth/login?redirect=${encodeURIComponent(targetPath)}`;
};

/**
 * Validates and cleans a redirect URL to prevent redirect loops
 * 
 * @param redirectUrl The URL from a redirect parameter
 * @returns A safe URL to redirect to
 */
export const validateRedirectUrl = (redirectUrl: string | null): string => {
  // Default to home if no redirect URL
  if (!redirectUrl) return '/';
  
  try {
    // Decode the URL (it may be encoded multiple times)
    let decodedUrl = redirectUrl;
    
    // Hard limit on decoding to prevent infinite loops
    let decodeCount = 0;
    const MAX_DECODE_ATTEMPTS = 10;
    
    while (decodedUrl !== decodeURIComponent(decodedUrl) && decodeCount < MAX_DECODE_ATTEMPTS) {
      decodedUrl = decodeURIComponent(decodedUrl);
      decodeCount++;
    }
    
    // Check for potential redirect loops by looking for auth/login
    if (decodedUrl.includes('/auth/login') || decodedUrl.includes('/login')) {
      console.warn('Detected potential redirect loop:', decodedUrl);
      return '/';
    }
    
    // Check for deep nested redirects (which could indicate a loop)
    if (decodedUrl.includes('redirect=')) {
      console.warn('Detected nested redirects (potential loop):', decodedUrl);
      return '/';
    }
    
    // Ensure it's an internal URL (starts with /)
    if (!decodedUrl.startsWith('/')) {
      console.warn('Invalid redirect URL (not internal):', decodedUrl);
      return '/';
    }
    
    return decodedUrl;
  } catch (e) {
    console.error('Error processing redirect URL:', e);
    return '/';
  }
};
