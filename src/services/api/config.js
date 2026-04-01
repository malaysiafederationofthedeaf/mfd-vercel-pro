const useBff = true;
const BFF_BASE_URL = ""; // Empty string forces relative paths, resolving to the Vercel host.
const STRAPI_BASE_URL = "";

export const API_BASE = useBff ? BFF_BASE_URL : STRAPI_BASE_URL;
