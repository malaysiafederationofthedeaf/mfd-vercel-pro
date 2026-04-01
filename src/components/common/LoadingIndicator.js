import React from "react";

const LoadingIndicator = () => {
  return (
    <div className="loading-container d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
      <div className="spinner-border text-primary" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingIndicator;