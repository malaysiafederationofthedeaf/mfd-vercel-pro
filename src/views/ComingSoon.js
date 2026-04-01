import React from "react";
import { Container } from "shards-react";
import { useTranslation } from "react-i18next";
import BackButton from "../components/common/BackButton";
import StopwatchIcon from "../images/general/icon/stopwatch-coming-soon-icon";

const ComingSoon = () => {
  const { t } = useTranslation();
  return (
    <Container fluid className="main-content-container px-4 pb-4">
      <div className="error">
        <div className="error__content">
          <StopwatchIcon height={150} width={150} />
          <h1>{t("coming_soon")}</h1>
          <h2>{t("stay_tuned")} </h2>
          <p>{t("new_content")}</p>
          <BackButton />
        </div>
      </div>
    </Container>
  );
};

export default ComingSoon;
