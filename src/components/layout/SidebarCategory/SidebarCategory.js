import React from "react";
import classNames from "classnames";

import SidebarCategoryItems from "./SidebarCategoryItems";

class SidebarCategory extends React.Component {
  render() {
    const classes = classNames("main-sidebar");
    return (
      <div className={classes}>
        <SidebarCategoryItems param={this.props.urlParam} />
      </div>
    );
  }
}

export default SidebarCategory;
