import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Col } from "shards-react";
import ItemsCarousel from "react-items-carousel";
import { useTranslation } from "react-i18next";

import PageTitle from "../common/PageTitle";
import FeaturedVideoDetail from "./FeaturedVideoDetail";

const FeaturedVideoList = ({videoItems}) => {
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const { t } = useTranslation();

  return (
    <Col sm="12" md="6" lg="6" xl="4">
      <div className="category-card-wrapper">
        <Link to={`/featured-videos`}>
          <PageTitle title={t("featured_videos")} />
        </Link>
        <ItemsCarousel
          // Carousel configurations
          numberOfCards={1}
          gutter={12}
          showSlither={true}
          firstAndLastGutter={true}
          freeScrolling={false}
          // Active item configurations
          requestToChangeActive={(activeItemIndex) =>
            setActiveItemIndex(activeItemIndex)
          }
          activeItemIndex={activeItemIndex}
          activePosition={"center"}
          chevronWidth={30}
          rightChevron={<i className="material-icons">arrow_forward_ios</i>}
          leftChevron={<i className="material-icons">arrow_back_ios</i>}
          outsideChevron={false}
        >
          {videoItems.map((videoItem, key) => (
            <FeaturedVideoDetail className="featured-video"
              video={videoItem}
              key={key}
            />
          ))}
        </ItemsCarousel>
      </div>
    </Col>
  );
};

export default FeaturedVideoList;
