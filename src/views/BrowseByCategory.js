import React, { useState, useEffect } from "react";
import { Container, Row } from "shards-react";
import { useTranslation } from "react-i18next";

import CategoryList from "../components/category-vocabs/CategoryList";
import {
  getGroupItems,
  getCategoryLength,
  getGroupLength,
  getCategoriesOfGroup,
} from "../services/api/categoryAPI";

// Add this utility function at the top of the file (after imports)
const convertToUrlFormat = (str) => {
  if (!str) return '';
  return str
    .replace(/\s*&\s*/g, '-and-')  // Convert & to -and-
    .replace(/\//g, '--')          // Convert / to --
    .replace(/\s+/g, '-')          // Convert spaces to hyphens
    .toLowerCase();                // Convert to lowercase
};

// Add a function to convert URL format back to API format
const convertFromUrlFormat = (urlString) => {
  if (!urlString) return '';
  return decodeURIComponent(urlString)
    .replace(/-and-/g, ' & ')   // Convert -and- to &
    .replace(/--/g, '/')        // Convert -- to /
    .replace(/-/g, ' ');        // Convert remaining hyphens to spaces
};

const BrowseByCategory = () => {
  const { t, i18n } = useTranslation();
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMalay = i18n.language === "ms";

  // Load group and category data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const categoryLength = await getCategoryLength();
        const groupLength = await getGroupLength();
        const [groupData, categoryData] = await Promise.all([
          getGroupItems(),
          getCategoriesOfGroup(),
        ]);

        setGroups(groupData);
        setCategories(categoryData);
        setLoading(false);

        console.log("Group Length:", groupLength);
        console.log("Category Length:", categoryLength);

        // Logging group data
        groupData.forEach((group, index) => {
          console.log(`Calling Group ${index + 1}: ${group.group}`);
        });
      } catch (err) {
        console.error("Error fetching category data:", err);
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <Container fluid className="main-content-container">
        <Row className="p-4">
          <h1>{t("category")}</h1>
        </Row>
        <Row>
          <div className="col-12 text-center p-5">
            <p>Loading categories...</p>
          </div>
        </Row>
      </Container>
    );
  }

  // Show error state
  if (error) {
    return (
      <Container fluid className="main-content-container px-4">
        <Row className="p-4">
          <h1>{t("category")}</h1>
        </Row>
        <Row>
          <div className="col-12 text-center p-5">
            <p>Error loading data: {error.message}</p>
          </div>
        </Row>
      </Container>
    );
  }

  // Show empty state
  if (groups.length === 0 || categories.length === 0) {
    return (
      <Container fluid className="main-content-container px-4">
        <Row className="p-4">
          <h1>{t("category")}</h1>
        </Row>
        <Row>
          <div className="col-12 text-center p-5">
            <p>No categories found. Please check the API connection.</p>
          </div>
        </Row>
      </Container>
    );
  }

  // Inside the return statement, where CategoryList is rendered
  return (
    <div className="category-list-wrapper">
      <Container fluid className="main-content-container">
        <Row className="p-4">
          <h1>{t("category")}</h1>
        </Row>
        <Row>
          {groups.map((group, key) => {
            const groupName = isMalay ? group.kumpulan : group.group;
            const groupKey = group.group; // English identifier
            const isNewSigns = groupKey === "New Signs";
            const items = categories[groupKey] || [];

            // Sort "New Signs" dynamically by language
            const sortedItems = isNewSigns
              ? [...items].sort((a, b) =>
                  isMalay
                    ? (a.perkataan || "").localeCompare(b.perkataan || "")
                    : (a.word || "").localeCompare(b.word || "")
                )
              : items;

            return (
              <CategoryList
                key={key}
                group={groupName}
                groupKey={groupKey}
                category={sortedItems}
              />
            );
          })}
        </Row>
      </Container>
    </div>
  );
};

export default BrowseByCategory;
