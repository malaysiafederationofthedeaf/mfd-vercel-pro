import React from "react";
import PropTypes from "prop-types";
import {
  Navbar,
  NavbarToggler,
  Nav,
  Collapse,
} from "shards-react";

import bimLogo from "../../../images/bim/logo/bim-logo.jpg";
import NavbarBackButton from "../../common/NavbarBackButton";
import NavbarNavItems from "./NavbarNavItems";
import NavbarTranslate from "./NavbarTranslate";
import SearchInput from "../Searchbar/SearchInput";
import { NavLink } from 'react-router-dom';

class MainNavbar extends React.Component {
  constructor(props) {
    super(props);
    this.toggleNavbar = this.toggleNavbar.bind(this);
    this.state = {
      collapseOpen: false,
    };
  }

  toggleNavbar() {
    this.setState(prevState => ({ collapseOpen: !prevState.collapseOpen }));
  }

  closeNavbar = () => {
    this.setState({ collapseOpen: false });
  }

  render() {
    return (
      <Navbar type="light" expand="md" className="main-navbar" fixed="top">
        {window.location.pathname !== "/home" && <NavbarBackButton />}
        <NavLink to="/home" className="navbar-brand">
          <img className="navbar-logo" src={bimLogo} alt="BIM Logo" />
        </NavLink>
        <SearchInput />
        <NavbarTranslate />
        <NavbarToggler onClick={this.toggleNavbar} />

        <Collapse
          open={this.state.collapseOpen}
          className="navbar-menu-items"
          navbar
        >
          <Nav navbar>
            <NavbarNavItems closeNavbar={this.closeNavbar} />
          </Nav>
          {!this.state.collapseOpen && (
            <div className="navbar-right-logo">
              {this.props.linkDetails.map((link, key) => (
                <a href={link.href} target="_blank" rel="noopener noreferrer" key={key}>
                  <img src={link.imgSrc} alt={link.imgAlt} />
                </a>
              ))}
            </div>
          )}
        </Collapse>
      </Navbar>
    );
  }
}

MainNavbar.propTypes = {
  /**
   * The about MFD preview object.
   */
  linkDetails: PropTypes.array,
};

MainNavbar.defaultProps = {
  linkDetails: [
    {
      href: "https://www.mymfdeaf.org/pengenalan",
      imgSrc: require("../../../images/mfd/mfd-logo.jpg"),
      imgAlt: "MFD Logo",
    },
    {
      href: "https://careers.guidewire.com/guidewire-gives-back",
      imgSrc: require("../../../images/ggb/ggb-logo.jpg"),
      imgAlt: "GGB Logo",
    },
  ],
};

export default MainNavbar;
