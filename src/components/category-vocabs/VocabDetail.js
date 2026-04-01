import React from "react";
import { Col, Row } from "shards-react";
import ReactPlayer from 'react-player';

import { Store } from "../../flux";
import VocabWordPerkataan from "./VocabWordPerkataan";

const VocabDetail = ({vocab}) => {
    const useBlobImages = process.env.REACT_APP_USE_BLOB_IMAGES === "true";
    const vocabImgSrc = useBlobImages && vocab.imageUrl ? vocab.imageUrl : Store.getSignImgSrc(vocab.perkataan);

    return (
        <div className="selected-vocab">
            <Row className="selected-vocab-title">
                <Col>
                    <VocabWordPerkataan word={vocab.word} perkataan={vocab.perkataan} />
                </Col>
            </Row>
            <Row className="selected-vocab-detail">        
                <Col xl="6" lg="12" md="12" sm="12">
                    <div className="selected-vocab-image-wrapper">
                        <img 
                         src={vocabImgSrc} 
                         alt={vocab.word} 
                         className="selected-vocab-image"  
                         onError={(e) => {
                            e.target.onerror = null; // prevent infinite loop
                            e.target.src = require("../../images/general/image-coming-soon.jpg");
                        }
                        }
                    />
                    </div>
                </Col>                                
                <Col xl="6" lg="12" md="12" sm="12" >
                    <div>
                        {vocab.video === undefined ? 
                            // if there is no video url
                            <div className="selected-vocab-image-wrapper">     
                                <img src={require(`../../images/general/video-coming-soon.jpg`)} alt={vocab.word}className="selected-vocab-image" />
                            </div> :
                            <div className="selected-vocab-video-wrapper">
                                <ReactPlayer url={vocab.video} playing={true} controls={true} loop={true} width="100%"/>
                            </div>
                        }
                    </div>
                </Col>                    
            </Row>
        </div>
    );
}

export default VocabDetail;
