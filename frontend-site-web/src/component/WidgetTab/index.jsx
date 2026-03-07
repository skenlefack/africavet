import React, { useState } from "react";
import ProtoTypes from "prop-types";
import { TabContent, TabPane, Nav, NavItem, Fade } from "reactstrap";
import classnames from "classnames";
import { Link } from "react-router-dom";
import { useData } from "../../context/DataContext";

// Images par défaut
import thumb1 from "../../assets/img/gallery-1.jpg";
import thumb2 from "../../assets/img/gallery-2.jpg";
import thumb3 from "../../assets/img/gallery-3.jpg";
import thumb4 from "../../assets/img/gallery-4.jpg";
import thumb5 from "../../assets/img/gallery-5.jpg";

const defaultData = [
  { id: 1, image: thumb1, title: "Chargement...", category: "Actualités", categorySlug: "news", date: "", slug: "#" },
  { id: 2, image: thumb2, title: "Chargement...", category: "Actualités", categorySlug: "news", date: "", slug: "#" },
  { id: 3, image: thumb3, title: "Chargement...", category: "Actualités", categorySlug: "news", date: "", slug: "#" },
  { id: 4, image: thumb4, title: "Chargement...", category: "Actualités", categorySlug: "news", date: "", slug: "#" },
  { id: 5, image: thumb5, title: "Chargement...", category: "Actualités", categorySlug: "news", date: "", slug: "#" },
];

const WidgetTabPane = ({ arr, a_id, id, dark }) => {
  return (
    <Fade in={id === a_id}>
      <div className="widget tab_widgets">
        {arr.map((item, i) => (
          <div key={item.id || i}>
            <div className="single_post widgets_small">
              <div className="post_img">
                <div className="img_wrap">
                  <Link to={`/article/${item.slug}`}>
                    <img src={item.image} alt={item.title} />
                  </Link>
                </div>
              </div>
              <div className="single_post_text">
                <div className="meta_info">
                  <Link to={`/categorie/${item.categorySlug || 'news'}`} className="category_label">
                    {item.category}
                  </Link>
                  <span className="meta_separator">•</span>
                  <span className="post_date">{item.date}</span>
                </div>
                <h4>
                  <Link to={`/article/${item.slug}`}>{item.title}</Link>
                </h4>
              </div>
            </div>
            <div className="space-15" />
            {dark ? (
              <div className="border_white" />
            ) : (
              <div className="border_black" />
            )}
            <div className="space-15" />
          </div>
        ))}
      </div>
    </Fade>
  );
};

WidgetTabPane.propTypes = {
  arr: ProtoTypes.array,
  a_id: ProtoTypes.string,
  id: ProtoTypes.string,
  dark: ProtoTypes.bool,
};

const WidgetTab = ({ className, dark }) => {
  const [activeTab, setActiveTab] = useState("1");
  const { recentPosts, loading } = useData();

  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  // Utiliser les données API ou fallback
  const data = recentPosts.length > 0 ? recentPosts : defaultData;

  return (
    <div className={`widget_tab md-mt-30 ${className ? className : ""}`} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Nav tabs>
        <NavItem>
          <Link
            to="/"
            className={classnames({ active: activeTab === "1" })}
            onClick={(e) => {
              e.preventDefault();
              toggle("1");
            }}
          >
            RÉCENTS
          </Link>
        </NavItem>
        <NavItem>
          <Link
            to="/"
            className={classnames({ active: activeTab === "2" })}
            onClick={(e) => {
              e.preventDefault();
              toggle("2");
            }}
          >
            POPULAIRES
          </Link>
        </NavItem>
      </Nav>
      <TabContent activeTab={activeTab}>
        <TabPane tabId="1">
          <WidgetTabPane dark={dark} a_id={activeTab} id="1" arr={data} />
        </TabPane>
        <TabPane tabId="2">
          <WidgetTabPane dark={dark} a_id={activeTab} id="2" arr={data} />
        </TabPane>
      </TabContent>
    </div>
  );
};

export default WidgetTab;

WidgetTab.propTypes = {
  className: ProtoTypes.string,
  dark: ProtoTypes.bool,
};
