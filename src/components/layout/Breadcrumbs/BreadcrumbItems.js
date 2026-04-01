import React from "react";
import { Breadcrumb, BreadcrumbItem } from "shards-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Function to trim words for display
const trimWord = (word) => {
  const length = word.length;
  if (length >= 45) {
    if (word.includes('(') && word.includes(')')) {
      word = word.substring(0, word.indexOf('(') - 1);
    }
  }
  return word;
};

const BreadcrumbItems = ({ vocab }) => {
  const { t } = useTranslation(["word", "group-category"]);
  const location = useLocation();
  const { pathname } = location;

  // Split the pathname into breadcrumb parts
  const pathParts = pathname.split('/').filter(part => part);

  return (
    <div className="breadcrumbs">
      <Breadcrumb>
        {pathParts.map((part, index) => {
          const breadcrumbPath = `/${pathParts.slice(0, index + 1).join('/')}`;
          const isLast = index === pathParts.length - 1;

          return (
            <BreadcrumbItem key={breadcrumbPath} active={isLast}>
              {isLast ? (
                vocab === undefined ? (
                  <>{t(`group-category:${part}`)}</>
                ) : (
                  <>{t(`word:${trimWord(part)}`)}</>
                )
              ) : (
                <Link to={breadcrumbPath}>
                  <>{t(`group-category:${part}`)}</>
                </Link>
              )}
            </BreadcrumbItem>
          );
        })}
      </Breadcrumb>
    </div>
  );
};

export default BreadcrumbItems;