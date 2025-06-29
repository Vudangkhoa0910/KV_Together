const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const getCampaignImageUrl = (imagePath?: string | File | null): string | null => {
  if (!imagePath) return null;
  
  // If it's a File object, return a temporary URL
  if (imagePath instanceof File) {
    return URL.createObjectURL(imagePath);
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it starts with /, remove it to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  return `${API_URL}/storage/${cleanPath}`;
};

export const getAvatarUrl = (avatarPath?: string | null): string | null => {
  if (!avatarPath) return null;
  
  // If it's already a full URL, return as is
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath;
  }
  
  // If it starts with /, remove it to avoid double slashes
  const cleanPath = avatarPath.startsWith('/') ? avatarPath.slice(1) : avatarPath;
  
  return `${API_URL}/storage/${cleanPath}`;
};

export const getImageUrl = (imagePath?: string | null): string | null => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it starts with /, remove it to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  return `${API_URL}/storage/${cleanPath}`;
};
