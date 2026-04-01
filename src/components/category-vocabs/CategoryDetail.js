import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, CardTitle } from "shards-react";
import { useTranslation } from "react-i18next";
import styled, { keyframes } from 'styled-components';
import { zoomIn } from 'react-animations';

import { Store } from "../../flux";
import { getImageWithFallback } from "../components-overview/ImgSrc";

const ZoomIn = styled.div`animation: .5s ${keyframes `${zoomIn}`}`;  

const CategoryDetail = ({ categoryItem, group, groupKey, noOfCard }) => {
  const { i18n } = useTranslation(["word", "group-category"]);

  const isMalay = i18n.language === "ms";
  const groupFormatted = Store.formatString(groupKey);
  const categoryFormatted = Store.formatString(categoryItem.category);
  const basePath = `/groups/${groupFormatted}`
  const linkToPath = categoryItem.new ? `${basePath}/${Store.formatString(categoryItem.word)}` : `${basePath}/${categoryFormatted}`;
  const useBlobImages = process.env.REACT_APP_USE_BLOB_IMAGES === "true";
  const imgSrc = categoryItem.new ? (useBlobImages && categoryItem.imageUrl ? categoryItem.imageUrl : Store.getSignImgSrc(categoryItem.perkataan)) : Store.getCategoryImgSrc(categoryItem.kategori);
  const fallback = Store.getFallbackImage();
  const [bgImage, setBgImage] = useState("");

  useEffect(() => {
    getImageWithFallback(imgSrc, fallback, (resolvedURL) => {
      setBgImage(resolvedURL);
    });
  }, [imgSrc]);

  // determine if the word to be displayed is Word from New Sign; or a Category
  const categoryWord = categoryItem.new ? isMalay ? categoryItem.perkataan : categoryItem.word : isMalay ? categoryItem.kategori : categoryItem.category;

  // get the length of word; or the longest substring if it contains space
  const length = categoryWord.split(" ").sort((a, b) => (b.length-a.length))[0].length;
  const fontSizeTemp = 30-(length);

  // to set the font size of card title dynamically
  // based on window.width, number of cards, length of the word, and whether the word contains spaces
  const getFontSize = () => {
    // 1. Three cards
    if(noOfCard >= 3 ) {
      if(length >= 10) {
        return (window.innerWidth >= 1500) ? (fontSizeTemp-5+"px") : (fontSizeTemp-4+"px");
      }
      else { return "17px"; }
    }
    // 2. Two cards
    else if(noOfCard === 2) {
      if((window.innerWidth > 1200)) {
        return (length >= 10) ? (fontSizeTemp-2+"px") : "17px";
      }           
      else if((window.innerWidth <= 1200 && window.innerWidth >= 875)) {
        return (length >= 10) ? "16px" : "18px";
      }    
      else if(window.innerWidth >= 765) {
          return (length >= 10) ? (fontSizeTemp-3+"px") : "16px";
        }                 
        else if((window.innerWidth <= 765 && window.innerWidth >= 500)) {
          return "19px";
        }
        else if((window.innerWidth <= 460 && window.innerWidth > 320)) {
          return (length >= 10) ? (fontSizeTemp-5+"px") : "17px";
        }
        else { return "18px"; }
    }
    // 3. One card
    else if(noOfCard === 1) { return "18px"; }
  }

  const [fontSize, setFontSize] = useState(
    getFontSize()
  );

  // setFontSize when window resizes
  function handleResize() {
    setFontSize(getFontSize());
  }
  window.addEventListener("resize", handleResize);

  // setFontSize when category/ word to be displayed changes (switched language)
  useEffect(() => {
    setFontSize(getFontSize());
    return (_) => {
      window.removeEventListener("resize", handleResize);
    };
  }, [categoryWord]);

  return (
    <Link to={linkToPath}>
      <Card small className="card-post card-post--1">
        <ZoomIn>
          <div
            className="card-post__image"
            style={{ backgroundImage: bgImage }}>
            </div>
        </ZoomIn>
        <CardBody>
          <CardTitle className="card-title">
            { <span style={{fontSize: fontSize}}>{categoryWord}</span> }
          </CardTitle>
        </CardBody>
      </Card>
    </Link>
  );
};

export default CategoryDetail;
