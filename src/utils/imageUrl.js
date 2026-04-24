import { STATIC_BASE_URL } from './constants';

/**
 * Returns a safe image URL.
 * - If already a full https:// URL (Cloudinary) → use as-is
 * - If a local path like /uploads/... → prefix with STATIC_BASE_URL
 * - If null/undefined → return null
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // Already a full URL (Cloudinary or any https link)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Local path — prefix with backend base URL
  return `${STATIC_BASE_URL}${imageUrl}`;
};

/**
 * Returns a placeholder image if the URL is missing or broken
 */
export const getImageUrlWithFallback = (imageUrl, fallback = '/placeholder.jpg') => {
  return getImageUrl(imageUrl) || fallback;
};