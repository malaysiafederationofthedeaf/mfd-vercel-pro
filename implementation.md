
---

# Implementation Changes Log

This document details the changes made to decouple data fetching from the central Flux store to component-specific API services. The implementation follows a modular approach that uses dedicated API services and React hooks for data fetching.

---

## 1. Data Fetching Decoupling Implementation Log

### Overview

* **Objective:** Decouple data fetching from the central Flux store by using component-specific API services.
* **Approach:** Modular design with dedicated API services and React hooks for asynchronous data retrieval, including caching and error handling.

---

### 1.1 Created API Service Modules

#### **alphabetAPI.js**

* **Purpose:** Dedicated service for alphabet-related data fetching.
* **Features:**

  * Utility functions for string formatting and locale detection.
  * Functions to fetch the alphabets list.
  * Direct API calls to fetch vocabulary data by alphabet.
  * API-level filtering to optimize data retrieval.
  * Caching mechanism to avoid repeated API calls.
  * Fallback to using Store data if API calls fail.

```javascript
// Key functions implemented:
- getAlphabetsList()
- fetchVocabData()
- fetchVocabsByAlphabetFromAPI(alphabetFirst)
- getVocabsByAlphabet(alphabetFirst)
- getVocabsFromStore(alphabetFirst, vocabsItems)
```

---

### 1.2 Updated View Components

#### **SelectedAlphabet.js**

* **Modifications:**

  * Integrated the new API service for data fetching.
  * Added React hooks (useState, useEffect) for state management.
  * Implemented asynchronous data fetching with loading and error states.
  * Improved user experience with loading indicators and debugging logs.

```javascript
// Key changes:
- Added state variables: vocabs, loading, error
- Implemented useEffect hook for data fetching
- Added conditional rendering for loading/error states
- Updated component to handle async data properly
```

---

### 1.3 API Optimization

#### **Improved API Filtering**

* **Enhancements:**

  * Added filtering parameters directly to API requests.
  * Implemented case-sensitive filtering using uppercase for the first letter.
  * Included pagination handling for large datasets.
  * Upgraded error handling and logging mechanisms.

```javascript
// Example of an optimized API call:
const response = await axios.get(
  `https://mfd-final-test.onrender.com/api/bims?populate=*&pagination[page]=${page}&pagination[pageSize]=25&filters[${fieldToFilter}][$startsWith]=${uppercaseAlphabet}`
);
```

---

### 1.4 Data Processing Improvements

#### **Enhanced Data Transformation**

* **Changes:**

  * Standardized field names and formats.
  * Filtered data for released items only.
  * Implemented locale-aware sorting.
  * Added data validation to manage missing fields.

---

### 1.5 Error Handling and Fallbacks

#### **Robust Error Management**

* **Strategy:**

  * Wrapped asynchronous operations in try/catch blocks.
  * Defined fallback mechanisms when API calls fail.
  * Integrated detailed error logging.
  * Displayed user-friendly error messages in the UI.

---

### 1.6 Enhanced Caching Strategy

#### **Alphabet-Specific Caching**

* **Improvements:**

  * Implemented an alphabet-specific cache using a `Map` data structure.
  * Added timestamp tracking for each cached alphabet.
  * Applied cache expiration logic and fallback to expired cache during API errors.
  * Developed cache clearing functionality.

```javascript
// Key caching improvements:
- Alphabet-specific cache with Map
- Timestamp tracking for cache freshness
- Cache hit/miss logging
- Fallback to expired cache during errors
- Cache clearing functionality
```

---

### 1.7 Created Vocabulary API Service

#### **vocabAPI.js**

* **Purpose:** Service dedicated to fetching vocabulary details.
* **Features:**

  * Functions to fetch vocabulary details by name.
  * Case-sensitive search with capitalization of the first letter.
  * Vocabulary-specific caching mechanism.
  * Fallback to Store data if API calls fail.

```javascript
// Key functions implemented:
- getVocabDetail(vocabName)
- fetchVocabDetailFromAPI(vocabName)
- clearVocabCache(vocabName)
```

#### **Cross-Service Data Sharing**

* **Details:**

  * Shared cache exported from `alphabetAPI` for use in `vocabAPI`.
  * Added a function to search for a vocabulary item in the existing alphabet data.
  * Prioritized using cached data over making new API calls.

```javascript
// Key optimization:
const findVocabInAlphabetData = (vocabName) => {
  // Check if the vocabulary exists in alphabet cache
  // Return cached data if found
}
```

* **Benefits:**

  * Prevents redundant API calls when navigating from the alphabet list to vocabulary detail.
  * Improves application performance and responsiveness.
  * Facilitates seamless page transitions.
  * Reduces server load and bandwidth usage.

---

### 1.8 Updated SelectedVocab Component

#### **SelectedVocab.js**

* **Modifications:**

  * Integrated the new API service for vocabulary details.
  * Added React hooks for state management (categoryVocab, vocabDetails, loading, error).
  * Implemented asynchronous data fetching with proper error handling and loading indicators.

```javascript
// Key changes:
- Added state variables: categoryVocab, vocabDetails, loading, error
- Implemented useEffect hook for data fetching
- Added conditional rendering for loading/error states
- Updated component to handle async data properly
```

---

### 1.9 Next Steps

1. **Apply decoupling:** Extend similar decoupling to other views (e.g., `SelectedCategory.js`).
2. **Develop additional API services:** Create additional modules like `categoryAPI.js`.
3. **Implement custom hooks:** Develop custom hooks for each data type.
4. **Reduce central dependencies:** Gradually reduce dependencies on the central Flux store.
5. **Consider persistent caching:** Evaluate using localStorage for caching across sessions.
6. **Implement deduplication:** Add request deduplication for concurrent requests.

---

## 2. Featured Videos Decoupling Refactor

This section outlines the refactoring of the featured videos functionality, involving the creation of a new API service for fetching featured videos from YouTube and the updating of the `FeaturedVideos` component to align with the new pattern.

---

### 2.1 API Service: `featuredVideosAPI.js`

**Path:** `/src/services/api/featuredVideosAPI.js`

* **Overview:**
  Created a dedicated API service for handling featured videos data fetching using a caching strategy and fallback mechanisms to the Store.

* **Key Functionalities:**

  * **Cache Mechanism:** Uses a `Map` to store video data with a timestamp to define cache duration (10 minutes).
  * **Fetch from API:** Makes an asynchronous call to fetch videos and transforms the response data.
  * **Fallback Handling:** Reverts to using Store data if the API or cache fails.
  * **Cache Management:** Provides functionality to clear the cache.
  * **Video URL Retrieval:** Offers a helper function to retrieve video URLs from the Store.

```javascript
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

    // Use cache if valid
    if (cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION) && videosCache.size > 0) {
      console.log(`Using cached data for featured videos`);
      return Array.from(videosCache.values());
    }

    // Fallback to Store
    const storeVideos = Store.getFeaturedVideosList();
    if (storeVideos && storeVideos.length > 0) {
      console.log(`Using Store data for featured videos`);
      videosCache.clear();
      storeVideos.forEach(video => videosCache.set(video.id, video));
      cacheTimestamp = now;
      return storeVideos;
    }

    // API fetch
    console.log(`Cache and Store miss for featured videos, fetching from API`);
    const videos = await fetchFeaturedVideosFromAPI();

    if (videos && videos.length > 0) {
      videosCache.clear();
      videos.forEach(video => videosCache.set(video.id, video));
      cacheTimestamp = now;
    }

    return videos;
  } catch (error) {
    console.error("Error in getFeaturedVideos:", error);
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
```

---

### 2.2 Component: `FeaturedVideos.js`

**Path:** `/src/views/FeaturedVideos.js`

* **Overview:**
  The component now uses the new API service to fetch featured videos, managing state and rendering accordingly.

* **Key Features:**

  * Uses React hooks for state management (`useState`, `useEffect`).
  * Asynchronous data fetching with loading, error, and empty states.
  * Renders a loading spinner, error messages, and a list of featured videos.

```javascript
import React, { useState, useEffect } from "react";
import { Container, Row } from "shards-react";
import { useTranslation } from "react-i18next";

import FeaturedVideoFrame from "../components/featured-videos/FeaturedVideoFrame";
import { getFeaturedVideos } from "../services/api/featuredVideosAPI";

const FeaturedVideos = () => {
  const { t } = useTranslation();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching featured videos data");

        const data = await getFeaturedVideos();
        if (data && data.length > 0) {
          setVideos(data);
          console.log(`Received ${data.length} featured videos`);
        } else {
          console.log("No featured videos found");
          setError(new Error("No featured videos available"));
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching featured videos:", err);
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <Container fluid className="main-content-container">
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading featured videos...</p>
        </div>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container fluid className="main-content-container">
        <div className="alert alert-danger">
          Error loading featured videos: {error.message}
        </div>
      </Container>
    );
  }

  // No videos state
  if (!videos || videos.length === 0) {
    return (
      <Container fluid className="main-content-container">
        <div className="alert alert-info">
          No featured videos available at this time.
        </div>
      </Container>
    );
  }

  return (
    <div className="category-list-wrapper">
      <Container fluid className="main-content-container">
        <Row className="p-4">
          <section id={videos[0]?.id || "featured-videos"}>
            <h1>{t("featured_videos")}</h1>
          </section>
        </Row>
        {videos.map(video => (
          <FeaturedVideoFrame video={video} key={video.id} id={video.id} />
        ))}
      </Container>
    </div>
  );
};

export default FeaturedVideos;
```

---

### 2.3 Summary of Improvements

1. **API Service Created:**

   * `featuredVideosAPI.js` now handles all data fetching for featured videos.
2. **Caching Enabled:**

   * Reduces unnecessary API calls and improves performance.
3. **Fallback Handling:**

   * Uses Store data if the API or cache fails.
4. **Better User Experience:**

   * Added a loading spinner and user-friendly error messages.
5. **Simplified Component:**

   * `FeaturedVideos` now solely handles rendering and state management.

---

This Markdown-formatted document provides a comprehensive record of the decoupling and refactoring changes, focusing on technical details, optimizations, error handling, and the rationale behind each update.
