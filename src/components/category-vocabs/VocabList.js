import React from "react";
import { Link } from "react-router-dom";
import { Col, ListGroup, ListGroupItem, Row } from "shards-react";

import { Store } from "../../flux";
import { getVocabImageUrl, handleImageError } from "../../utils/imageUtils";
import VocabWordPerkataan from "./VocabWordPerkataan";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";

const VocabList = ({ vocabs, group, category }) => {
  const { visibleItems, setTargetRef } = useInfiniteScroll(vocabs, 20, 20);

  const trimWord = (word) => {
    // console.log("word: " + word)
    const length = word.length
    if(length >= 45) {
      if(word.includes('(') && word.includes(')')) {
        word = word.substring(0, word.indexOf('('));
        // console.log("trimmed: " + word)
      }
    } 
    return word;
  }

  return (
    <ListGroup flush>
      {visibleItems.map((vocab, key) => {
        const groupTitle = group === undefined ? vocab.group : group;
        const categoryTitle =
          category === undefined ? vocab.category : category;

        const vocabImgSrc = getVocabImageUrl(vocab);

        const groupFormatted = Store.formatString(groupTitle);
        const categoryFormatted = Store.formatString(categoryTitle);
        const wordFormatted = Store.formatString(vocab.word);
        const basePath = `/groups/${groupFormatted}`
        const linkToPath = groupFormatted === "new-signs" ? `${basePath}/${wordFormatted}` : `${basePath}/${categoryFormatted}/${wordFormatted}`;

        return (
          <Link
            key={key}
            to={`${linkToPath}`}
          >
            <ListGroupItem className="double">
              <Row className="vocab-word">              
                <Col className="vocab-image-wrapper">
                  <img
                    src={vocabImgSrc}
                    alt={vocab.word}
                    loading="lazy"
                    style={{ objectFit: 'cover' }}
                    className="vocab-image"
                    onError={(e) => handleImageError(e, vocab)}
                  />
                </Col>   
                <Col className="pl-2 pr-0">
                  <VocabWordPerkataan
                    word={trimWord(vocab.word)}
                    perkataan={trimWord(vocab.perkataan)}
                  />
                </Col>
              </Row>
            </ListGroupItem>
          </Link>
        );
      })}
      {vocabs?.length > visibleItems.length && (
        <div ref={setTargetRef} style={{ height: "20px", display: "flex", justifyContent: "center", alignItems: "center", width: "100%", opacity: 0.5 }}>
          <div className="spinner-border text-primary spinner-border-sm" role="status" />
        </div>
      )}
    </ListGroup>
  );
};

export default VocabList;
