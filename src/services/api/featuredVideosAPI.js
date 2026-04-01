import axios from "axios";
import { Store } from "../../flux";

// Cache mechanism
const videosCache = new Map();
let cacheTimestamp = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Fetch featured videos from YouTube API
export const fetchFeaturedVideosFromAPI = async () => {
  try {
    const response = await axios.get(Store.getFeaturedVideosPlaylistUrl());
    
    if (!response.data || !response.data.items) {
      console.error('Invalid API response structure:', response);
      return null;
    }
    
    // Transform the data
    const transformedData = response.data.items.map(item => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      publishedAt: item.snippet.publishedAt
    }));
    
    return transformedData;
  } catch (error) {
    console.error("Error fetching featured videos:", error);
    return null;
  }
};

// Get featured videos with caching
export const getFeaturedVideos = async () => {
  try {
    const now = Date.now();
    
    // Check if we have cached data
    if (cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION) && videosCache.size > 0) {
      console.log(`Using cached data for featured videos`);
      return Array.from(videosCache.values());
    }
    
    // If not in cache, first check Store
    const storeVideos = Store.getFeaturedVideosList();
    if (storeVideos && storeVideos.length > 0) {
      console.log(`Using Store data for featured videos`);
      
      // Update cache
      videosCache.clear();
      storeVideos.forEach(video => {
        videosCache.set(video.id, video);
      });
      cacheTimestamp = now;
      
      return storeVideos;
    }
    
    // If not in Store, fetch from API
    console.log(`Cache and Store miss for featured videos, fetching from API`);
    const videos = await fetchFeaturedVideosFromAPI();
    
    // Store in cache
    if (videos && videos.length > 0) {
      videosCache.clear();
      videos.forEach(video => {
        videosCache.set(video.id, video);
      });
      cacheTimestamp = now;
    }
    
    return videos;
  } catch (error) {
    console.error("Error in getFeaturedVideos:", error);
    
    // Fallback to Store if API call fails and no cache exists
    console.log("Falling back to Store data for featured videos");
    return Store.getFeaturedVideosList();
  }
};

// Clear videos cache
export const clearVideosCache = () => {
  videosCache.clear();
  cacheTimestamp = null;
  console.log("Videos cache cleared");
};

// Get video URL
export const getVideoUrl = (videoId) => {
  return Store.getFeaturedVideoUrl(videoId);
};