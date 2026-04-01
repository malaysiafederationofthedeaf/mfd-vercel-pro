import React from "react";
import { Breadcrumb } from "shards-react";

import BreadcrumbItems from "./BreadcrumbItems";

class Breadcrumbs extends React.Component {

  render() {
    return (
      <div className="category-breadcrumbs">
        <Breadcrumb>
          <BreadcrumbItems vocab={this.props.vocab}/>
        </Breadcrumb>
      </div>
    );
  }

}

export default Breadcrumbs;
