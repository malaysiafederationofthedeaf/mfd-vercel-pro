import React from "react";
import PropTypes from "prop-types";

import { Row, Col } from "shards-react";

const AboutUsDetails = ({ aboutUsDetails, t }) => 
<div className="about-us-wrapper">
  {aboutUsDetails.map((vocab, key) => {
    return (
      <div className="about-us" key={key}>
        <Col>
          {/* logo & title */}
          <Row className="about-us-title">
            <Col lg="2" md="12" sm="12" xs="12">
              <div className="about-us-title-logo">
                <img src={vocab.logo} alt={vocab.name} />
              </div>
            </Col>
            <Col lg="10" md="12" sm="12" xs="12">
              <h1 className="about-us-title-text" data-aos="fade-up">{t(vocab.metaTitle)}</h1>
            </Col>
          </Row>

          {/* paragraph texts */}
          {vocab.metaValue.map((paragraph, key) =>
            <p data-aos="fade-up" data-aos-delay="400" key={key}>{t(paragraph)}</p>         
          )} 

          {/* for more */}
          <p data-aos="fade-up" data-aos-delay="400" className="about-us-for-more">
            {t(vocab.forMore)}
            <a href={t(vocab.forMoreLink)} target="_blank" rel="noopener noreferrer" key={key}>
              {t(vocab.forMoreLink)}
            </a>
            .
          </p>                               
        </Col>
      </div> 
    )
  })}
</div>     

AboutUsDetails.propTypes = {
  /**
   * The user details object.
   */
  aboutUsDetails: PropTypes.array,
};

AboutUsDetails.defaultProps = {
  aboutUsDetails: [
    {
      name: "bim_name",
      logo: require("./../../images/bim/logo/bim-logo.jpg"),
      image: require("./../../images/mfd/mfd-about.jpg"),
      metaTitle: "about_bim_title",
      metaValue: [ 
        "about_bim_1",
        "about_bim_2",
        "about_bim_3",
        "about_bim_4",
      ],
      forMore: "about_bim_more",
      forMoreLink: "about_bim_more_link"
    },    
    {
      name: "mfd_name",
      logo: require("./../../images/mfd/mfd-logo.jpg"),
      image: require("./../../images/mfd/mfd-kids.jpg"),
      metaTitle: "about_mfd_title",
      metaValue: [ 
        "about_mfd_1", 
        "about_mfd_2", 
      ],   
      forMore: "about_mfd_more",
      forMoreLink: "about_mfd_more_link"
    },
    {
      name: "ggb_name",
      logo: require("./../../images/ggb/ggb-logo.jpg"),
      metaTitle: "about_ggb_title",
      metaValue: [ 
        "about_ggb_1", 
        "about_ggb_2", 
        "about_ggb_3", 
      ],
      forMore: "about_ggb_more",
      forMoreLink: "about_ggb_more_link"
    },
    {
      name: "vercel_name",
      logo: require("./../../images/general/logo/vercel-logo.jpg"),
      metaTitle: "about_vercel_title",
      metaValue: [ 
        "about_vercel_1", 
        "about_vercel_2", 
        "about_vercel_3", 
      ],
      forMore: "about_vercel_more",
      forMoreLink: "about_vercel_more_link"
    },        
  ],
};

export default AboutUsDetails;
