// Image utility functions for handling blob vs Cloudinary images
import { Store } from "../flux";

// Get the best available image URL for a vocab item
export const getVocabImageUrl = (vocab) => {
  const useBlobImages = process.env.REACT_APP_USE_BLOB_IMAGES === "true";
  const blobBaseUrl = process.env.REACT_APP_BLOB_BASE_URL;

  // If blob images are enabled, generate blob URL from normalized perkataan
  if (useBlobImages && blobBaseUrl && vocab?.perkataan) {
    const normalizedPerkataan = vocab.perkataan
      .trim()
      .replace(/&/g, "_")
      .replace(/[()'']/g, "")
      .replace(/,/g, "")
      .replace(/!/g, "%21")
      .replace(/\//g, "-")
      .replace(/\s+/g, "_");
    return `${blobBaseUrl}/vocab/${normalizedPerkataan}.jpg`;
  }

  // No fallback to Cloudinary - return null to trigger error handling
  return null;
};

// Get fallback image URL
export const getFallbackImageUrl = () => {
  // Use a data URL placeholder instead of Cloudinary
  return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+";
};

// Handle image load errors - try fallback, then give up
export const handleImageError = (event, vocab) => {
  const img = event.target;

  // If this is the first error and we haven't tried the fallback yet
  if (!img.dataset.triedFallback) {
    img.dataset.triedFallback = "true";
    img.src = getFallbackImageUrl();
  } else {
    // Already tried fallback, hide the image or show placeholder
    img.style.display = "none";
    console.warn(`Failed to load image for vocab: ${vocab?.word || vocab?.perkataan}`);
  }
};