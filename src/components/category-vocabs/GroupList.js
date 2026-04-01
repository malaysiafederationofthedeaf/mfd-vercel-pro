import React from "react";
import { Row } from "shards-react";
import GroupDetail from "./GroupDetail";

const GroupList = ({categories, group}) => {
  return(
      <Row>
        {categories.map((category, key) => (
          <GroupDetail category={category} group={group} key={key} />
        ))}
      </Row>        
  );
}

export default GroupList;
