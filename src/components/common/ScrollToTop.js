import React, { useEffect, Fragment } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop({ children }) {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top when the location changes
    if (window.location.hash === "") {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return <Fragment>{children}</Fragment>;
}

export default ScrollToTop;