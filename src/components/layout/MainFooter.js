import React from "react";
import PropTypes from "prop-types";
import { Container, Nav } from "shards-react";
import { useTranslation } from "react-i18next";

const MainFooter = ({ contained, menuItems, copyright, footerLinks }) => {
  const { t } = useTranslation();
  return (
    <footer className="main-footer p-2 bg-white border-top">
      <Container fluid={contained}>
        <Nav>
          {menuItems.map((item, key) => (
            <a href={item.href} target="_blank" rel="noopener noreferrer" key={key} className="main-footer-items">
              {t(item.title)}
            </a>
          ))}
        </Nav>
        <span className="copyright ml-auto my-auto mr-2">{t(copyright)}</span>
        <div className="footer-logo d-inline ml-auto my-auto mr-2">
          {footerLinks.map((link, key) => (
            <a href={link.href} target="_blank" rel="noopener noreferrer" key={key}>
              <img src={link.imgSrc} alt={link.imgAlt} />
            </a>
          ))}
        </div>
      </Container>
    </footer>
  );
};

MainFooter.propTypes = {
  /**
   * Whether the content is contained, or not.
   */
  contained: PropTypes.bool,
  /**
   * The menu items array.
   */
  menuItems: PropTypes.array,
  /**
   * The copyright info.
   */
  copyright: PropTypes.string,
  /**
   * The footer links array.
   */
  footerLinks: PropTypes.array,
};

MainFooter.defaultProps = {
  contained: false,
  copyright: "copyright",
  menuItems: [
    {
      title: "footer_item_1_title",
      href: "https://www.mymfdeaf.org/hubungi-kami",
    },
    {
      title: "footer_item_2_title",
      href: "https://www.mymfdeaf.org/",
    },
    {
      title: "footer_item_3_title",
      href: "https://careers.guidewire.com/guidewire-gives-back",
    },
  ],
  footerLinks: [
    {
      href: "https://www.facebook.com/BahasaIsyaratMalaysiaMFD/",
      imgSrc: require("../../images/general/logo/fb-logo.jpg"),
      imgAlt: "FB Logo",
    },
    {
      href: "https://www.instagram.com/mfd.2020/",
      imgSrc: require("../../images/general/logo/ig-logo.jpg"),
      imgAlt: "IG Logo",
    },
    {
      href: "https://www.youtube.com/channel/UC0jqY7pMc7iKE4TqsKWellw",
      imgSrc: require("../../images/general/logo/youtube-logo.jpg"),
      imgAlt: "Youtube Logo",
    },
    {
      href: "https://vercel.com/?utm_source=ggb-mfd&utm_campaign=oss",
      imgSrc: require("../../images/general/logo/powered-by-vercel.svg"),
      imgAlt: "Powered by Vercel Logo",
    },    
  ],
};

export default MainFooter;
