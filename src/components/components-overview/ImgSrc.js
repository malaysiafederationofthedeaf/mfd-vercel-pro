/**
 * Preloads an image and returns the valid image URL or fallback if not found.
 * @param {string} primarySrc - The primary image URL.
 * @param {string} fallbackSrc - The fallback image URL.
 * @param {function} callback - Callback function to handle the result.
 */
export function getImageWithFallback(primarySrc, fallbackSrc, callback) {
    const img = new Image();
    img.src = primarySrc;
  
    img.onload = () => {
      callback(`url('${primarySrc}')`);
    };
  
    img.onerror = () => {
      callback(`url('${fallbackSrc}')`);
    };
  }
  