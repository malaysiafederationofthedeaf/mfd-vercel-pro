import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import GoogleAnalytics from "react-ga";

GoogleAnalytics.initialize(process.env.REACT_APP_GAID || "UA-115105611-2");

const withTracker = (WrappedComponent, options = {}) => {
  const HOC = (props) => {
    const location = useLocation();
    
    useEffect(() => {
      if (process.env.NODE_ENV !== "production") {
        return;
      }

      const page = location.pathname + location.search;
      GoogleAnalytics.set({
        page,
        ...options
      });
      GoogleAnalytics.pageview(page);
    }, [location]);

    return <WrappedComponent {...props} />;
  };

  return HOC;
};

export default withTracker;