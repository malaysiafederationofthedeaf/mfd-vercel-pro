import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

import Button from "../common/Button";
import { Link } from "react-router-dom";

const AboutUsPreview = ({ bimDetails }) => {
  const { t } = useTranslation();
  return (
    <div className="bim-preview d-flex align-items-center">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 d-flex flex-column justify-content-center">
            <h1 data-aos="fade-up">{t(bimDetails.name).toLocaleUpperCase()}</h1>
            <div data-aos="fade-up" data-aos-delay="600">
              <div className="text-center text-lg-start">
                <Link to="/groups" >
                  <Button text={t("category_btn")}/>
                </Link>
              </div>
            </div>
          </div>
          <div
            className="col-lg-6 bim-preview-img"
            data-aos="zoom-out"
            data-aos-delay="200"
          >
            <img src={bimDetails.logo} alt="BIM Books" className="img-fluid" />
          </div>
        </div>
      </div>
    </div>
  );
};
AboutUsPreview.propTypes = {
  /**
   * The about MFD preview object.
   */
  bimDetails: PropTypes.object,
};

AboutUsPreview.defaultProps = {
  bimDetails: {
    name: "bim_name",
    logo: require("../../images/mfd/mfd-bim-books.jpg"),
  },
};

export default AboutUsPreview;
