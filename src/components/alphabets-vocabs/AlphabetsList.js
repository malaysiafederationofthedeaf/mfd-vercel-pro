import React from "react";
import { Link } from "react-router-dom";
import { Col, ListGroup, ListGroupItem, Row } from "shards-react";

import { Store } from "../../flux";
import VocabWordPerkataan from "../category-vocabs/VocabWordPerkataan";

const AlphabetsList = ({ vocabs, alphabet }) => {

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
        const vocabImgSrc = Store.getSignImgSrc(vocab.perkataan);
        const wordFormatted = Store.formatString(vocab.word);
        return (
          <Link key={key} to={`/alphabets/${alphabet}/${wordFormatted}`}>
            <ListGroupItem className="double">
              <Row className="vocab-word">
              <Col className="vocab-image-wrapper">
                  <img
                    src={vocabImgSrc}
                    alt={vocab.word}
                    className="vocab-image"
                    onError={(e) => {
                      e.target.onerror = null; // prevent infinite loop
                      e.target.src = Store.getFallbackImage();
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

export default AlphabetsList;
