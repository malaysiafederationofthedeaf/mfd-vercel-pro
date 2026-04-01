import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import Select, { components } from "react-select";
import { useNavigate } from "react-router-dom";
import i18next from "i18next";
import axios from "axios";
import { Store } from "../../../flux";

const MAX_PAGES = 5;
// Removing VALID_RELEASES constraint
const CACHE_KEY = "searchVocabularyData";
const CACHE_TIMESTAMP_KEY = "searchVocabularyTimestamp";
const CACHE_DURATION_MS = 10 * 60 * 1000;

const SearchInput = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [openMenu, setOpenMenu] = useState(false);
  const currentLanguage = i18next.language;
  const debounceRef = useRef(null);
  const isMounted = useRef(true);

  const transformData = (data) => (
    data.map(item => ({
      groupCategory: item.category_group?.GroupCategory || `${item.Group}/${item.Category}`,
      word: item.Word || '',
      perkataan: item.Perkataan || ''
    }))
    // Removed filter for VALID_RELEASES
  );

  const fetchVocabularyData = async () => {
    setLoading(true);
    try {
      const cachedData = sessionStorage.getItem(CACHE_KEY);
      const cachedTimestamp = sessionStorage.getItem(CACHE_TIMESTAMP_KEY);
      const now = Date.now();

      if (cachedData && cachedTimestamp && (now - parseInt(cachedTimestamp)) < CACHE_DURATION_MS) {
        setOptions(JSON.parse(cachedData));
        return;
      }

      let allData = [];
      for (let page = 1; page <= MAX_PAGES; page++) {
        const res = await axios.get(`https://bimsignbank-strapi.onrender.com/api/bims?populate=*&pagination[page]=${page}&pagination[pageSize]=100`);
        const pageData = res.data?.data || [];
        allData = [...allData, ...pageData];

        const { pageCount } = res.data.meta.pagination;
        if (page >= pageCount) break;
      }

      const filteredData = transformData(allData).sort((a, b) =>
        currentLanguage === "en" ? a.word.localeCompare(b.word) : a.perkataan.localeCompare(b.perkataan)
      );

      sessionStorage.setItem(CACHE_KEY, JSON.stringify(filteredData));
      sessionStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString());

      if (isMounted.current) setOptions(filteredData);
    } catch (error) {
      console.error("Vocabulary fetch error:", error);
      setOptions(Store.getSortedVocabsItems(currentLanguage));
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const searchSpecificTerm = async (query) => {
    if (!query || query.length < 2) return;

    try {
      const field = currentLanguage === "en" ? "Word" : "Perkataan";
      const res = await axios.get(`https://bimsignbank-strapi.onrender.com/api/bims?populate=*&filters[${field}][$containsi]=${query}`);
      const results = transformData(res.data?.data || []);

      const seen = new Set(options.map(opt => currentLanguage === "en" ? opt.word : opt.perkataan));
      const uniqueResults = results.filter(item => !seen.has(currentLanguage === "en" ? item.word : item.perkataan));

      if (uniqueResults.length) {
        const updated = [...options, ...uniqueResults].sort((a, b) =>
          currentLanguage === "en" ? a.word.localeCompare(b.word) : a.perkataan.localeCompare(b.perkataan)
        );
        setOptions(updated);
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(updated));
        sessionStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      }
    } catch (err) {
      console.error("Search term fetch error:", err);
    }
  };

  const handleInputChange = (input, { action }) => {
    if (action !== "input-change") return;
    setSearchInput(input);
    setOpenMenu(true);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchSpecificTerm(input), 300);
  };

  const handleSelectChange = (selected) => {
    if (!selected) return;

    const groupCategory = selected.groupCategory.split(",")[0];
    const [groupRaw, categoryRaw] = groupCategory.split("/");
    const group = Store.formatString(groupRaw);
    const category = Store.formatString(categoryRaw);
    const word = Store.formatString(selected.word);

    navigate(`/groups/${group}/${category}/${word}`);
    setOpenMenu(false);
  };

  useEffect(() => {
    isMounted.current = true;
    fetchVocabularyData();
    return () => {
      isMounted.current = false;
      clearTimeout(debounceRef.current);
    };
  }, [currentLanguage]);

  const Menu = (props) => <components.Menu {...props}>{props.children}</components.Menu>;

  return (
    <div className="search-bar">
      <form>
        <Select
          options={options}
          onChange={handleSelectChange}
          isLoading={loading}
          getOptionLabel={(option) => (
            <strong className="text-m-2">
              {currentLanguage === "en" ? option.word : option.perkataan}
            </strong>
          )}
          getOptionValue={(option) => currentLanguage === "en" ? option.word : option.perkataan}
          onInputChange={handleInputChange}
          onBlur={() => setOpenMenu(false)}
          menuIsOpen={openMenu}
          value={null}
          placeholder={loading ? t("loading") : t("search_placeholder")}
          noOptionsMessage={() => loading ? t("loading") : t("no_results")}
          filterOption={(option, input) => {
            const label = currentLanguage === "en" ? option.data.word : option.data.perkataan;
            return label.toLowerCase().includes(input.toLowerCase());
          }}
          components={{ Menu }}
        />
      </form>
    </div>
  );
};

export default SearchInput;
