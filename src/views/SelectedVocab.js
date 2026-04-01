import React, { useState, useEffect } from "react";
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, CardBody } from "shards-react";
import cookies from "js-cookie";
import i18next from "i18next";

import ComingSoon from "./ComingSoon";
import VocabDetail from "../components/category-vocabs/VocabDetail";
import Breadcrumbs from "../components/layout/Breadcrumbs/Breadcrumbs";
import { getVocabDetail, findSimilarWords } from "../services/api/vocabAPI";

const SelectedVocab = () => {
  const { vocab } = useParams();
  // Decode the URL parameter to handle words with spaces
  const decodedVocab = decodeURIComponent(vocab.replace(/-/g, ' '));
  const [categoryVocab, setCategoryVocab] = useState(null);
  const [vocabDetails, setVocabDetails] = useState(null);
  const [similarWords, setSimilarWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLang, setCurrentLang] = useState(cookies.get("i18next") || "ms");
  
  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      const newLang = cookies.get("i18next") || "ms";
      if (newLang !== currentLang) {
        setCurrentLang(newLang);
      }
    };
    
    i18next.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18next.off('languageChanged', handleLanguageChange);
    };
  }, [currentLang]);
  
  // Fetch data when component mounts or vocab/language changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log(`Fetching data for vocab: ${decodedVocab} with language: ${currentLang}`);
        const data = await getVocabDetail(decodedVocab);
        
        if (data) {
          setCategoryVocab(data);
          setVocabDetails(data[0]);
          console.log(`Received vocab details for: ${decodedVocab}`);
          
          // Use the localized word based on current language for finding similar words
          const localizedWord = currentLang === "ms" ? data[0].perkataan : data[0].word;
          console.log(`Finding similar words for localized word: ${localizedWord}`);
          
          const similar = await findSimilarWords(localizedWord, 5);
          setSimilarWords(similar);
          console.log(`Found ${similar.length} similar words`);
        } else {
          console.log(`No data found for vocab: ${decodedVocab}`);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching vocab data:", err);
        setError(err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [vocab, decodedVocab, currentLang]);
  
  // Show loading state
  if (loading) {
    return (
      <Container fluid className="main-content-container px-4">
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading details for "{vocab}"...</p>
        </div>
      </Container>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <Container fluid className="main-content-container px-4">
        <div className="alert alert-danger">
          Error loading data: {error.message}
        </div>
      </Container>
    );
  }
  
  // return Error page if no Vocab Details are returned
  if (!categoryVocab) return <ComingSoon />;

  return (
    <>
      <div className="breadcrumbs-selected-vocab">
        <Breadcrumbs vocab={categoryVocab} />
      </div>
      <Container
        fluid
        className="main-content-container vocab-list-wrapper"
      >
        <VocabDetail vocab={vocabDetails} />
        
        {/* Similar Words Section */}
        {similarWords.length > 0 && (
          <Card className="mt-4">
            <CardBody>
            <h4>{currentLang === "ms" ? "Lihat Juga" : "See Also"}</h4>
            <Row>
                {similarWords.map((word, idx) => {
                  // Determine the correct routing based on the word's category/group
                  let routePath;
                  
                  // If the word has category information, use the group/category route
                  if (word.groupCategory && word.groupCategory.includes('/')) {
                    const [group, category] = word.groupCategory.split('/').map(part => 
                      part.trim().replace(/\s+/g, '-').replace(/&/g, '-and-').replace(/\//g, '--')
                    );
                    routePath = `/groups/${group}/${category}/${word.word.replace(/\s+/g, '-')}`;
                  } else {
                    // Default to alphabet route if no category info
                    routePath = `/alphabets/${word.word.charAt(0).toLowerCase()}/${word.word.replace(/\s+/g, '-')}`;
                  }
                  
                  return (
                    <Col key={idx} md={4} sm={6} className="mb-3">
                      <Link 
                        to={routePath}
                        className="similar-word-link"
                      >
                        {currentLang === "ms" ? word.perkataan : word.word}
                      </Link>
                    </Col>
                  );
                })}
              </Row>
            </CardBody>
          </Card>
        )}
      </Container>
    </>
  );
};

export default SelectedVocab;
