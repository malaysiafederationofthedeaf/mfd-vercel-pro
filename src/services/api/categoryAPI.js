import axios from "axios";
import cookies from "js-cookie";
import { Store } from "../../flux";
import { getNewSigns } from './alphabetAPI';

// Utility function to format strings
const formatString = (str) => {
  return Store.formatString(str);
};

// Get current locale setting from cookies (default to English)
const getCurrentLocale = () => {
  return cookies.get("i18next") || "en";
};

// Cache variables to avoid redundant API calls and reprocessing
let categoryCache = null;
let groupCache = null;

// Fetches all category data from the API with pagination
const fetchCategoryData = async () => {
  if (categoryCache) return categoryCache;

  let allData = [];
  let page = 1;
  let hasMoreData = true;

  while (hasMoreData) {
    try {
      const response = await axios.get(
        `/api/category-groups?pagination[page]=${page}&pagination[pageSize]=90&filters[Remark][$ne]=Unpublished`
      );

      // Ensure response is structured correctly
      if (!response.data || !response.data.data) {
        console.error("Invalid API response structure:", response);
        break;
      }

      // Transform each item with safe fallbacks
      const transformedData = response.data.data.map((item) => ({
        KumpulanKategori: item.KumpulanKategori || "",
        GroupCategory: item.GroupCategory || "",
        Remark: item.Remark || "",
      }));

      // Merge new data into the total dataset
      allData = [...allData, ...transformedData];

      // Check if more pages exist
      hasMoreData = page < response.data.meta.pagination.pageCount;
      page++;
    } catch (err) {
      console.error("Error fetching data:", err);
      hasMoreData = false;
    }
  }

  categoryCache = allData;
  return allData;
};

// Processes raw category data to extract unique group entries
const restructureJSONGroup = (data) => {
  if (!Array.isArray(data)) {
    console.error("Invalid data structure received:", data);
    return [];
  }

  // Filter and transform valid data items
  const validGroups = data
    .filter(
      (item) =>
        item &&
        typeof item.GroupCategory === "string" &&
        typeof item.KumpulanKategori === "string"
    )
    .map((item) => {
      try {
        // Extract base group/kumpulan by splitting on '/' and trimming
        const group = item.GroupCategory.split("/")[0]?.trim() || "";
        const kumpulan = item.KumpulanKategori.split("/")[0]?.trim() || "";

        if (!group || !kumpulan) {
          console.warn("Invalid group structure:", item);
          return null;
        }

        return {
          group,
          kumpulan,
          remark: item.Remark || "",
          groupCategory: item.GroupCategory.trim(),
          kumpulanKategori: item.KumpulanKategori.trim(),
        };
      } catch (error) {
        console.error("Error processing item:", item, error);
        return null;
      }
    })
    .filter(Boolean); // Remove null entries

  // Deduplicate entries based on the `group` key
  const uniqueGroups = [];
  const seenGroups = new Set();

  validGroups.forEach((group) => {
    if (group?.group && !seenGroups.has(group.group)) {
      seenGroups.add(group.group);
      uniqueGroups.push(group);
    }
  });

  // Return default fallback if result is empty
  return uniqueGroups.length > 0
    ? uniqueGroups
    : [
        {
          group: "default",
          kumpulan: "default",
          remark: null,
          groupCategory: "",
          kumpulanKategori: "",
        },
      ];
};

// Return a list of unique group objects
export const getGroupList = async () => {
  if (groupCache) return groupCache;

  const data = await fetchCategoryData();
  const reconData = restructureJSONGroup(data);
  groupCache = reconData;
  return reconData;
};

// Return groups (unique)
export const getGroupItems = async () => {
  try {
    const groupData = await getGroupList();

    if (!groupData || groupData.length === 0) {
      console.warn("No group data available");
      return [];
    }

    const groups = groupData
    .filter((obj) => obj)
    .map((obj) => {
      return {
        group: obj.group || "",
        kumpulan: obj.kumpulan || "",
        remark: obj.remark || ""
      };
    });
    return groups;
  } catch (error) {
    console.error("Error getting group items:", error);
    return [];
  }
};

// Return groups and categories pair (unique)
const getCategoryItems = async () => {
  try {
    const categoryData = await fetchCategoryData();

    if (!categoryData || categoryData.length === 0) {
      console.warn("No category data available");
      return [];
    }

    const categories = categoryData
      .filter((obj) => obj)
      .map((obj) => {
        const group = obj.GroupCategory?.split("/")[0]?.trim() || "";
        const kumpulan = obj.KumpulanKategori?.split("/")[0]?.trim() || "";
        const category = obj.GroupCategory?.split("/")[1]?.trim() || "";
        const kategori = obj.KumpulanKategori?.split("/")[1]?.trim() || "";
        const remark = obj.remark;
        return { group, kumpulan, category, kategori, remark };
      })
    return categories;
  } catch (error) {
    console.error("Error getting group items:", error);
    return [];
  }
};

// Get category list based on Group
export const getCategoriesOfGroup = async (lang = "ms") => {
    try {
      const currentLanguageCode = getCurrentLocale();
      const groupList = await getGroupList(); // Get all groups
      const categoryItems = await getCategoryItems(); // Get all category info
      const allResults = {};
  
      for (const groupObj of groupList) {
        const groupName = formatString(groupObj.group);
  
        if (groupName === formatString("New Signs")) {
          const newSignsWords = await getNewSigns();
          const words = newSignsWords.map((item) => ({
            word: item.word,
            perkataan: item.perkataan,
            new: item.new,
          }));

          // Sort New Signs alphabetically
          if (currentLanguageCode === "en") {
            words.sort((a, b) => a.word.localeCompare(b.word));
          } else {
            words.sort((a, b) => a.perkataan.localeCompare(b.perkataan));
          }
  
          allResults["New Signs"] = words;
          continue;
        }
  
        const lookup = new Set();
        const filtered = [];
  
        for (const obj of categoryItems) {
          const objGroup = formatString(obj.group);
          const objCategory = formatString(obj.category);
  
          if (objGroup === groupName && !lookup.has(objCategory)) {
            lookup.add(objCategory);
            filtered.push({
              category: obj.category,
              kategori: obj.kategori,
            });
          }
        }
        
        // Sort categories alphabetically based on current language
        if (currentLanguageCode === "en") {
          filtered.sort((a, b) => a.category.localeCompare(b.category));
        } else {
          filtered.sort((a, b) => a.kategori.localeCompare(b.kategori));
        }
  
        allResults[groupObj.group] = filtered;
      }
  
      return allResults;
    } catch (error) {
      console.error("Error getting categories of group:", error);
      return {};
    }
  };

// Return the total number of category records fetched
export const getCategoryLength = async () => {
  const data = await fetchCategoryData();
  return data.length;
};

// Return the total number of unique groups
export const getGroupLength = async () => {
  const data = await getGroupList();
  return data.length;
};
