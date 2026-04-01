import axios from "axios";
import cookies from "js-cookie";
import { Store } from "../../flux";

// Utility functions
const formatString = (str) => Store.formatString(str);

const getCurrentLocale = () => cookies.get("i18next") || "en";

// API functions
export const getAlphabetsList = () => Store.getAlphabetsList();

// Fetch vocabulary data directly from API
export const fetchVocabData = async () => {
  let allData = [];
  let page = 1;
  let hasMoreData = true;

  while (hasMoreData) {
    try {
      const response = await axios.get(
        `/api/bims?populate=*&pagination[page]=${page}&pagination[pageSize]=25`
      );

      if (!response.data?.data) {
        console.error("Invalid API response structure:", response);
        break;
      }

      const transformedData = response.data.data.map((item) => {
        const categoryGroup = item.category_group || {};
        return {
          kumpulanKategori:
            categoryGroup.KumpulanKategori ||
            `${item.Kumpulan}/${item.Kategori}`,
          groupCategory:
            categoryGroup.GroupCategory || `${item.Group}/${item.Category}`,
          word: item.Word || "",
          perkataan: item.Perkataan || "",
          video: item.Video || "",
          tag: item.Tag || "",
          new: item.New || "No",
          order: item.Order || "",
          imgStatus: item.Image_Status || "",
        };
      });

      allData = [...allData, ...transformedData];
      hasMoreData = page < response.data.meta.pagination.pageCount;
      page++;
    } catch (err) {
      console.error("Error fetching data:", err);
      hasMoreData = false;
    }
  }

  const processedData = allData
    .map((item) => ({
      kumpulanKategori: item.kumpulanKategori
        .toString()
        .replaceAll(/(\r\n|\n|\r)/gm, ""),
      groupCategory: item.groupCategory
        .toString()
        .replaceAll(/(\r\n|\n|\r)/gm, ""),
      word: item.word.toString().trim(),
      perkataan: item.perkataan.toString().trim(),
      video: item.video,
      tag: item.tag,
      new: item.new,
      order: item.order,
      imgStatus: item.imgStatus,
    }))
    // Removed release filtering
    .sort((a, b) => a.kumpulanKategori.localeCompare(b.kumpulanKategori));

  return processedData;
};

// Alphabet-specific caching
let cachedVocabs = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000;

export const alphabetCache = new Map();
export const alphabetCacheTimestamps = new Map();

export const getVocabsByAlphabet = async (alphabetFirst) => {
  if (!alphabetFirst) return [];

  try {
    const now = Date.now();

    if (
      alphabetCache.has(alphabetFirst) &&
      alphabetCacheTimestamps.has(alphabetFirst) &&
      now - alphabetCacheTimestamps.get(alphabetFirst) < CACHE_DURATION
    ) {
      console.log(`Using cached data for alphabet: ${alphabetFirst}`);
      return alphabetCache.get(alphabetFirst);
    }

    console.log(`Cache miss for alphabet: ${alphabetFirst}, fetching from API`);
    const vocabAlpha = await fetchVocabsByAlphabetFromAPI(alphabetFirst);

    alphabetCache.set(alphabetFirst, vocabAlpha);
    alphabetCacheTimestamps.set(alphabetFirst, now);

    return vocabAlpha;
  } catch (error) {
    console.error("Error in getVocabsByAlphabet:", error);

    if (alphabetCache.has(alphabetFirst)) {
      console.log(
        `Using expired cache for alphabet: ${alphabetFirst} due to error`
      );
      return alphabetCache.get(alphabetFirst);
    }

    const storeVocabs = Store.getVocabsItems();
    if (storeVocabs && storeVocabs.length > 0) {
      console.log("Falling back to Store data");
      return getVocabsFromStore(alphabetFirst, storeVocabs);
    }

    return [];
  }
};

export const clearAlphabetCache = (alphabetFirst = null) => {
  if (alphabetFirst) {
    alphabetCache.delete(alphabetFirst);
    alphabetCacheTimestamps.delete(alphabetFirst);
    console.log(`Cache cleared for alphabet: ${alphabetFirst}`);
  } else {
    alphabetCache.clear();
    alphabetCacheTimestamps.clear();
    cachedVocabs = null;
    cacheTimestamp = null;
    console.log("All caches cleared");
  }
};

export const fetchVocabsByAlphabetFromAPI = async (alphabetFirst) => {
  if (!alphabetFirst) return [];

  let allData = [];
  let page = 1;
  let hasMoreData = true;
  const locale = getCurrentLocale();
  const fieldToFilter = locale === "ms" ? "Perkataan" : "Word";
  const uppercaseAlphabet = alphabetFirst.toUpperCase();

  console.log(
    `Fetching data with filter: ${fieldToFilter} starts with ${uppercaseAlphabet}`
  );

  while (hasMoreData) {
    try {
      const response = await axios.get(
        `/api/bims?populate=*&pagination[page]=${page}&pagination[pageSize]=25&filters[${fieldToFilter}][$startsWith]=${uppercaseAlphabet}`
      );

      if (!response.data?.data) {
        console.error("Invalid API response structure:", response);
        break;
      }

      const transformedData = response.data.data.map((item) => {
        const categoryGroup = item.category_group || {};
        return {
          kumpulanKategori:
            categoryGroup.KumpulanKategori ||
            `${item.Kumpulan}/${item.Kategori}`,
          groupCategory:
            categoryGroup.GroupCategory || `${item.Group}/${item.Category}`,
          word: item.Word || "",
          perkataan: item.Perkataan || "",
          video: item.Video || "",
          tag: item.Tag || "",
          new: item.New || "No",
          order: item.Order || "",
          imgStatus: item.Image_Status || "",
        };
      });

      allData = [...allData, ...transformedData];
      hasMoreData = page < response.data.meta.pagination.pageCount;
      page++;
    } catch (err) {
      console.error("Error fetching filtered data:", err);
      hasMoreData = false;
    }
  }

  const processedData = allData
    .map((item) => ({
      kumpulanKategori: item.kumpulanKategori
        .toString()
        .replaceAll(/(\r\n|\n|\r)/gm, ""),
      groupCategory: item.groupCategory
        .toString()
        .replaceAll(/(\r\n|\n|\r)/gm, ""),
      word: item.word.toString().trim(),
      perkataan: item.perkataan.toString().trim(),
      video: item.video,
      tag: item.tag,
      new: item.new,
      order: item.order,
      imgStatus: item.imgStatus,
    }))
    // Removed release filtering
    .sort((a, b) =>
      locale === "ms"
        ? a.perkataan.localeCompare(b.perkataan)
        : a.word.localeCompare(b.word)
    );

  console.log(
    `API returned ${processedData.length} items for ${uppercaseAlphabet}`
  );
  return processedData;
};

// Get new signs - fixed implementation with proper caching
export const getNewSigns = async () => {
  try {
    // Check if we have cached data for new signs
    const now = Date.now();
    const cacheKey = "new-signs";

    if (
      alphabetCache.has(cacheKey) &&
      alphabetCacheTimestamps.has(cacheKey) &&
      now - alphabetCacheTimestamps.get(cacheKey) < CACHE_DURATION
    ) {
      console.log(`Using cached data for new signs`);
      return alphabetCache.get(cacheKey);
    }

    console.log(`Cache miss for new signs, fetching from API`);

    const locale = getCurrentLocale();

    const response = await axios.get(
      `/api/bims?populate=*&sort=createdAt:desc&pagination[limit]=25`
    );

    const transformedData = response.data.data.map((item) => {
      const categoryGroup = item.category_group || {};
      return {
        kumpulanKategori:
          categoryGroup.KumpulanKategori || `${item.Kumpulan}/${item.Kategori}`,
        groupCategory:
          categoryGroup.GroupCategory || `${item.Group}/${item.Category}`,
        word: item.Word || "",
        perkataan: item.Perkataan || "",
        video: item.Video || "",
        tag: item.Tag || "",
        new: item.New || "No",
        order: item.Order || "",
        imgStatus: item.Image_Status || "",
      };
    });

    const processedData = transformedData
      .map((item) => ({
        kumpulanKategori: item.kumpulanKategori
          .toString()
          .replaceAll(/(\r\n|\n|\r)/gm, ""),
        groupCategory: item.groupCategory
          .toString()
          .replaceAll(/(\r\n|\n|\r)/gm, ""),
        word: item.word.toString().trim(),
        perkataan: item.perkataan.toString().trim(),
        video: item.video,
        tag: item.tag,
        new: item.new,
        order: item.order,
        imgStatus: item.imgStatus,
      }))
      // Additional client-side sorting to ensure correct alphabetical order
      .sort((a, b) =>
        locale === "ms"
          ? a.perkataan.localeCompare(b.perkataan)
          : a.word.localeCompare(b.word)
      );

    // Store in cache
    alphabetCache.set(cacheKey, processedData);
    alphabetCacheTimestamps.set(cacheKey, now);

    console.log(
      `API returned ${processedData.length} new sign items, sorted alphabetically`
    );
    return processedData;
  } catch (error) {
    console.error("Error in getNewSigns:", error);

    // Check if we have cached data even if it's expired
    const cacheKey = "new-signs";
    if (alphabetCache.has(cacheKey)) {
      console.log(`Using expired cache for new signs due to error`);
      return alphabetCache.get(cacheKey);
    }

    return [];
  }
};

const getVocabsFromStore = (alphabetFirst, vocabsItems) => {
  const locale = getCurrentLocale();

  return vocabsItems
    .filter((vocAl) =>
      locale === "ms"
        ? (vocAl.perkataan || vocAl.Perkataan)
            ?.toLowerCase()
            .startsWith(alphabetFirst.toLowerCase())
        : (vocAl.word || vocAl.Word)
            ?.toLowerCase()
            .startsWith(alphabetFirst.toLowerCase())
    )
    .sort((a, b) =>
      locale === "ms"
        ? (a.perkataan || a.Perkataan).localeCompare(b.perkataan || b.Perkataan)
        : (a.word || a.Word).localeCompare(b.word || b.Word)
    );
};
