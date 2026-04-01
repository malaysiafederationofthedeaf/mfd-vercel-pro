import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

// Initialize i18n with default configuration
i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(HttpApi)
  .init({
    supportedLngs: ["en", "ms"],
    fallbackLng: "en",
    detection: {
      order: ["path", "cookie", "htmlTag", "localStorage", "subdomain"],
      caches: ["cookie"]
    },
    backend: {
      loadPath: "/assets/locales/{{lng}}/translation.json"
    },
    interpolation: {
      escapeValue: false // not needed for react as it escapes by default
    }
  });

// Render the App inside a Suspense component to support lazy-loaded translations
ReactDOM.render(
  <Suspense fallback="Loading">
    <App />
  </Suspense>,
  document.getElementById("root")
);

// Measure performance if needed
reportWebVitals();