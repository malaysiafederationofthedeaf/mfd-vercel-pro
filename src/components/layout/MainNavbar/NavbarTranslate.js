import React, { useState, useEffect } from "react";
import i18next from "i18next";
import cookies from "js-cookie";
import { Button } from "shards-react";
import "flag-icon-css/css/flag-icons.min.css";
import { Store } from "../../../flux";

const languages = Store.getLanguages();
const countryCode = Store.getCountryCode();

const NavbarTranslate = () => {
  const [currentLanguageCode, setCurrentLanguageCode] = useState(cookies.get("i18next") || "ms");
  const [flag, setFlag] = useState(
    currentLanguageCode === languages[1] ? countryCode[1] : countryCode[0]
  );

  // Update state when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      const langCode = cookies.get("i18next") || "ms";
      setCurrentLanguageCode(langCode);
      setFlag(langCode === languages[1] ? countryCode[1] : countryCode[0]);
    };

    // Set initial state
    handleLanguageChange();

    // Listen for language changes
    i18next.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18next.off('languageChanged', handleLanguageChange);
    };
  }, []);

  const toggleLocale = () => {
    // Toggle between languages
    const newLang = currentLanguageCode === languages[1] ? languages[0] : languages[1];
    const newFlag = currentLanguageCode === languages[1] ? countryCode[0] : countryCode[1];
    
    // Change language
    i18next.changeLanguage(newLang);
    setFlag(newFlag);
    
    // Force reload if on alphabet page to refresh data
    // For category pages, we now handle language changes in the component
    if (window.location.pathname.includes('/alphabets/')) {
      window.location.reload();
    }
  };

  return (
    <div className="navbar-translate-btn">
      <Button onClick={toggleLocale}>
        <span className={`flag-icon flag-icon-${flag} p-1`}></span>
      </Button>
    </div>
  );
};

export default NavbarTranslate;
