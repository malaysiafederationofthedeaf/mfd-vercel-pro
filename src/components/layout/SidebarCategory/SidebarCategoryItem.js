import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Nav,
  Navbar,
  Fade,
} from "shards-react";
import { useTranslation } from "react-i18next";

import { getCategoriesOfGroup } from "../../../services/api/categoryAPI";
import { Store } from "../../../flux";

const SidebarCategoryItem = ({ item, alpha, param }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [groupCategories, setGroupCategories] = useState([]);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const { t, i18n } = useTranslation("group-category");
  const isMalay = i18n.language === "ms";
  const isNewSign = !param && item?.group === "New Signs";
  const groupFormatted = !param && item?.group ? Store.formatString(item.group) : null;
  const groupName = !param && item ? (isMalay ? item.kumpulan : item.group) : "";  
  const basePath = `/groups/${groupFormatted}`;

  const className = {
    ACTIVE: "active",
    INACTIVE: "inactive",
  };

  const isDropDownActive = () => {
    return window.location.pathname.search(
      !param ? `${basePath}` : `/alphabets/${param}`
    )
      ? className.INACTIVE
      : className.ACTIVE;
  };

  const isDropDownItemActive = (item) => {
    return window.location.pathname.includes(
      `${basePath}/${Store.formatString(item.category)}`
    )
      ? className.ACTIVE
      : className.INACTIVE;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const allGroups = await getCategoriesOfGroup();
        if (!param && item?.group && allGroups[item.group]) {
          setGroupCategories(allGroups[item.group]);
        } else {
          setGroupCategories([]);
        }
      } catch (err) {
        console.error("Failed to fetch group categories:", err);
        setGroupCategories([]);
      }
    };

    fetchCategories();
  }, [param, item?.group]);

  return (
    <Navbar>
      <Nav navbar>
        <Dropdown open={dropdownOpen} toggle={toggleDropdown}>
          {/* set className to active to highlight current active Group in Side Navbar */}
          <div className={isDropDownActive()}>
            {/* render according to the url parameter passed */}
            {!param ? (
              <>
                {groupCategories.length > 0 && !isNewSign && (
                  <DropdownToggle nav caret />
                )}
                <Link to={`${basePath}`}>
                  <div>{t(groupName)}</div>
                </Link>
                <Fade
                  in={isDropDownActive() === className.ACTIVE || dropdownOpen}
                >
                  <DropdownMenu>
                    {!isNewSign &&
                      groupCategories.map((item1, key) => (
                        <DropdownItem
                          key={key}
                          className={isDropDownItemActive(item1)}
                        >
                          <Link
                            to={`${basePath}/${Store.formatString(item1.category)}`}
                          >
                            {t(isMalay ? item1.kategori : item1.category)}
                          </Link>
                        </DropdownItem>
                      ))}
                  </DropdownMenu>
                </Fade>
              </>
            ) : (
              <>
                <Link
                  to={`/alphabets/${alpha}`}
                  className="text-decoration-none"
                >
                  <div>{alpha.toUpperCase()}</div>
                </Link>
                <DropdownToggle nav className="d-inline" />
              </>
            )}
          </div>
        </Dropdown>
      </Nav>
    </Navbar>
  );
};

SidebarCategoryItem.propTypes = {
  /**
   * The item object.
   */
  item: PropTypes.object,
};

SidebarCategoryItem.defaultProps = {
  param: null,
  item: null,
};

export default SidebarCategoryItem;
