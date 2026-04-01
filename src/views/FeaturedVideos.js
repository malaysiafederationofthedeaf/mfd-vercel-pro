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
  
  // Fetch data when component mounts
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
  
  // Show loading state
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
  
  // Show error state
  if (error) {
    return (
      <Container fluid className="main-content-container">
        <div className="alert alert-danger">
          Error loading featured videos: {error.message}
        </div>
      </Container>
    );
  }
  
  // No videos available
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
        {videos.map((video, key) => (
          <FeaturedVideoFrame video={video} key={key} id={video} />
        ))}
      </Container>
    </div>
  );
};

export default FeaturedVideos;
