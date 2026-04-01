function getSeededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function formatDateToSeed(date = new Date()) {
  return parseInt(date.toISOString().split("T")[0].replace(/-/g, ""), 10);
}

async function getTotalEntries(apiUrl) {
  const res = await fetch(`${apiUrl}?pagination[page]=1&pagination[pageSize]=1`);
  const json = await res.json();
  return json.meta.pagination.total;
}

async function fetchPageEntries(apiUrl, pageNum, pageSize) {
  const res = await fetch(`${apiUrl}?populate=*&pagination[page]=${pageNum}&pagination[pageSize]=${pageSize}`);
  const json = await res.json();
  return json.data || [];
}

export async function getSignOfTheDayLightweight() {
  const apiUrl = "https://bimsignbank-strapi.onrender.com/api/bims";
  const pageSize = 25;
  const seed = formatDateToSeed();
  const totalEntries = await getTotalEntries(apiUrl);
  const totalPages = Math.ceil(totalEntries / pageSize);

  // Pick a deterministic page number
  const pageSeed = getSeededRandom(seed);
  const pageNum = Math.floor(pageSeed * totalPages) + 1;

  // Fetch entries for that page
  const entries = await fetchPageEntries(apiUrl, pageNum, pageSize);

  // Filter only valid entries with video
  const validEntries = entries.filter(
    (e) => e?.Video_Status === "Published"
  );

  if (validEntries.length === 0) {
    console.warn("No valid SOTD entries found on page:", pageNum);
    return null;
  }

  // Pick a deterministic entry from valid ones
  const indexSeed = getSeededRandom(seed + 1);
  const index = Math.floor(indexSeed * validEntries.length);
  const selected = validEntries[index];

  // Return transformed object
  return {
    word: selected.Word || "",
    perkataan: selected.Perkataan || "",
    video: selected.Video || "",
    tag: selected.Tag || "",
    category: selected.category_group?.KumpulanKategori || "",
    group: selected.category_group?.GroupCategory || "",
    imgStatus: selected.Image_Status || "",
  };
}
