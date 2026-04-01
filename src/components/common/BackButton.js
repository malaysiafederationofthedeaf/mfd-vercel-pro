import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const BackButton = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <button
      className="btn-primary scrollto d-inline-flex align-items-center justify-content-center align-self-center"
      onClick={() => navigate(-1)}
    >
      <span>&larr; {t("go_back")}</span>
      <i className="bi bi-arrow-right"></i>
    </button>
  );
};

export default BackButton;
