import React, { useState } from "react";
import PropTypes from "prop-types";
import { NavLink as RouteNavLink } from "react-router-dom";
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, NavItem, NavLink } from "shards-react";
import { useTranslation } from "react-i18next";

const NavbarNavItem = ({ item, closeNavbar }) => {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const dropdownOpen = () => {setOpen(!open)};

  return (
    item.items === undefined 
    ?
      <NavItem className="navbar-menu-item">
        <NavLink tag={(props) => <RouteNavLink {...props} />} to={item.to} onClick={() => setTimeout(() => closeNavbar?.(), 15)}>
          {t(item.title) && <span>{t(item.title)}</span>}
        </NavLink>
      </NavItem> 
    :
      <Dropdown
        open={open}
        toggle={dropdownOpen}  
      >
        <DropdownToggle nav caret>
          {t(item.title)}
        </DropdownToggle>
        <DropdownMenu>
        {
          item.items.map((item, key) => (
            <DropdownItem className="navbar-menu-item" key={key}>
              <NavLink tag={(props) => <RouteNavLink {...props} />} to={item.to} onClick={() => setTimeout(() => closeNavbar?.(), 15)}>
                {t(item.title) && <span>{t(item.title)}</span>}
              </NavLink>
            </DropdownItem>
          ))
        }            
        </DropdownMenu>
      </Dropdown>
  );
};

NavbarNavItem.propTypes = {
  /**
   * The item object.
   */
  item: PropTypes.object,
};

export default NavbarNavItem;
