import React from "react";
import { Link } from "react-router-dom";
import { Col, ListGroup, ListGroupItem, Row } from "shards-react";

import { Store } from "../../flux";
import VocabWordPerkataan from "./VocabWordPerkataan";

const VocabList = ({ vocabs, group, category }) => {
  const trimWord = (word) => {
    console.log("word: " + word)
    const length = word.length
    if(length >= 45) {
      if(word.includes('(') && word.includes(')')) {
        word = word.substring(0, word.indexOf('('));
        console.log("trimmed: " + word)
      }
    } 
    return word;
  }

  return (
    <ListGroup flush>
      {vocabs.map((vocab, key) => {
        const groupTitle = group === undefined ? vocab.group : group;
        const categoryTitle =
          category === undefined ? vocab.category : category;

        const vocabImgSrc = Store.getSignImgSrc(vocab.perkataan);

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
                    className="vocab-image"
                    onError={(e) => {
                      e.target.onerror = null; // prevent infinite loop
                      e.target.src = `https://res.cloudinary.com/dvkbfpll1/image/upload/v1745120594/image-coming-soon.jpg`; //if there is no image url
                    }
                  }
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
    </ListGroup>
  );
};

export default VocabList;
