import React from "react";
import PropTypes from "prop-types";

const Button = ({ text, href, ...attrs }) => {
  return (
      <div href={href} className="btn-primary scrollto d-inline-flex align-items-center justify-content-center align-self-center">
        <span>{text}</span>
      </div>
  )
};

Button.propTypes = {
  /**
   * The button text
   */
  text: PropTypes.string,
  /**
   * The button link
   */
  href: PropTypes.string,
};

export default Button;
