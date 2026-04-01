import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "shards-react";
import { useTranslation } from "react-i18next";
import cookies from "js-cookie";
import { Link } from "react-router-dom";

import AboutUsPreview from "../components/about-us/AboutUsPreview";
import CategoryList from "../components/category-vocabs/CategoryList";
import FeaturedVideoList from "../components/featured-videos/FeaturedVideoList";
import SignOfTheDay from "../components/category-vocabs/SignOfTheDay";

import { Store } from "../flux";
import { getGroupItems, getCategoriesOfGroup } from "../services/api/categoryAPI";
import { getFeaturedVideos } from "../services/api/featuredVideosAPI";
import { getSignOfTheDayLightweight } from "../services/api/signOfTheDayAPI";

const newSignsCache = {};

// Preload the LCP image
const preloadLCPImage = () => {
  
  const preloadLink = document.createElement('link');
  preloadLink.rel = 'preload';
  preloadLink.as = 'image';
  preloadLink.href = '/assets/images/home-background.jpg'; 
  preloadLink.type = 'image/jpeg';
  preloadLink.fetchPriority = 'high';
  document.head.appendChild(preloadLink);
};

const Home = () => {
  const { t, i18n } = useTranslation();
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState({});
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [signOfDay, setSignOfDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLang] = useState(cookies.get("i18next") || "ms");
  const isMalay = i18n.language === "ms";

  // Call the preload function when component mounts
  useEffect(() => {
    preloadLCPImage();
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Fetch groups and filter for those with Remark="Home"
        const groupsData = await getGroupItems();
        const homeGroups = groupsData.filter(
          (group) => group?.group && group.remark === "Home"
        );
        setGroups(homeGroups);

        const videosData = await getFeaturedVideos();
        setFeaturedVideos(videosData || []);

        // Fetch Sign of the Day from API or local store cache
        const sotd = await getSignOfTheDayLightweight();
        setSignOfDay(sotd);
      } catch (error) {
        console.error("Error fetching home page data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [currentLang]);

  useEffect(() => {
    const lang = i18n.language;

    const fetchCategories = async () => {
      if (newSignsCache[lang]) {
        setCategories(newSignsCache[lang]);
        return;
      }

      try {
        const categoriesData = await getCategoriesOfGroup(i18n.language);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching new signs:", error);
      }
    };

    fetchCategories();
  }, [i18n.language]);


  if (loading) {
    return (
      <Container fluid>
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2">Loading content...</p>
        </div>
      </Container>
    );
  }

  return (
    <>
      <AboutUsPreview />
      <Container fluid>
        <div className="category-list-wrapper">
          <Row>
            {/* Only display groups with Remark="Home" */}
            {groups
              .filter(group => group.group !== "New Signs")
              .map((group, key) => {
                const groupName = isMalay ? group.kumpulan : group.group;
                const groupKey = group.group;
                
                return (
                  <CategoryList
                    category={categories[groupKey] ?? []}
                    group={groupName}
                    groupKey={groupKey}
                    key={key}
                    className="category-list"
                  />              
                );
              })}
          </Row>
          <Row>
            {/* View all categories button */}
            <Col sm="12" md="12" lg="12" className="btn-view-all-categories">
              <Link to="/groups">{t("view_all_category_btn")} &rarr;</Link>
            </Col>
            
            {/* Only show New Signs if it has Remark="Home" */}
            {groups.some(group => group.group === "New Signs") && (
              <CategoryList
              category={categories["New Signs"] ?? []}
              group={isMalay ? "Isyarat Baru" : "New Signs"}
              groupKey="New Signs"
            />
            )}
            
            {/* Featured Videos List */}
            <FeaturedVideoList videoItems={featuredVideos}/> 

            {/* Sign of The Day */}
            {signOfDay?.word && <SignOfTheDay wordItem={signOfDay} />}
          </Row>
        </div>
      </Container>
    </>
  );
};

export default Home;
