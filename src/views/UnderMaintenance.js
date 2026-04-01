import React from "react";
import { Container } from "shards-react";
import { useTranslation } from "react-i18next";

import ToolsIcon from "../images/general/icon/tools-maintenance-icon";

const UnderMaintenance = () => {
  const { t } = useTranslation();

  return (
    <Container fluid className="main-content-container px-4 pb-4">
      <div className="error">
        <div className="error__content">
          <ToolsIcon height={150} width={150} />
          <h1>{t("under_maintenance")}</h1>
          <h2>{t("be_back")}</h2>
          <p>{t("visit_again")}</p>
        </div>
      </div>
    </Container>
  );
};

export default UnderMaintenance;
