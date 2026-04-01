import React from "react";
import { Store } from "../../../flux";
import SidebarCategoryItem from "./SidebarCategoryItem";
import { getGroupItems } from "../../../services/api/categoryAPI";

class SidebarCategoryItems extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      vocabsItems: [],
      alphabets: Store.getAlphabetsList(),
    };

    this.onChange = this.onChange.bind(this);
  }

  async componentDidMount() {
    Store.addChangeListener(this.onChange);
    const groups = await getGroupItems();
    this.setState({ vocabsItems: groups });
  }

  componentWillMount() {
    Store.addChangeListener(this.onChange);
  }

  componentWillUnmount() {
    Store.removeChangeListener(this.onChange);
  }

  onChange() {
    this.setState({
      alphabets: Store.getAlphabetsList(),
    });
  }

  render() {
    const { vocabsItems: items, alphabets: alphas } = this.state;

    return (
      <div className="sidebar-category m-0">
        {!this.props.param
          ? items.map((item, key) => (
              <ul key={key}>
                <SidebarCategoryItem item={item} />
              </ul>
            ))
          : alphas.map((alpha, key) => (
            <ul key={key}>
              <SidebarCategoryItem alpha={alpha} param={this.props.param} />
            </ul>
          ))
        }
      </div>
    );
  }
}

export default SidebarCategoryItems;
