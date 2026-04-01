// Image utility functions for handling blob vs Cloudinary images
import { Store } from "../flux";

// Get the best available image URL for a vocab item
export const getVocabImageUrl = (vocab) => {
  const useBlobImages = process.env.REACT_APP_USE_BLOB_IMAGES === "true";

  // If blob images are enabled and vocab has an imageUrl, use it
  if (useBlobImages && vocab?.imageUrl) {
    return vocab.imageUrl;
  }

  // Fallback to Cloudinary
  return Store.getSignImgSrc(vocab?.perkataan);
};

// Get fallback image URL
export const getFallbackImageUrl = () => {
  return Store.getFallbackImage();
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