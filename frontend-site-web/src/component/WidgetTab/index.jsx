import React, { useState, useEffect } from "react";
import ProtoTypes from "prop-types";
import { TabContent, TabPane, Nav, NavItem, Fade } from "reactstrap";
import classnames from "classnames";
import { Link } from "react-router-dom";
import { useData } from "../../context/DataContext";

// Skeleton item for loading state
const SkeletonItem = ({ index }) => (
  <div>
    <div className="single_post widgets_small">
      <div className="post_img">
        <div className="img_wrap">
          <div style={{
            width: '100%', height: '100%', minHeight: '70px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #e2e8f0 0%, #f1f5f9 50%, #e2e8f0 100%)',
            backgroundSize: '200% 200%',
            animation: `widgetShimmer 1.8s ease ${index * 0.15}s infinite`
          }} />
        </div>
      </div>
      <div className="single_post_text" style={{ flex: 1 }}>
        <div style={{
          height: '10px', width: '60px', borderRadius: '4px', marginBottom: '8px',
          background: 'linear-gradient(90deg, #e2e8f0 0%, #f1f5f9 50%, #e2e8f0 100%)',
          backgroundSize: '200% 200%', animation: `widgetShimmer 1.8s ease ${index * 0.15}s infinite`
        }} />
        <div style={{
          height: '12px', width: '90%', borderRadius: '4px', marginBottom: '5px',
          background: 'linear-gradient(90deg, #e2e8f0 0%, #f1f5f9 50%, #e2e8f0 100%)',
          backgroundSize: '200% 200%', animation: `widgetShimmer 1.8s ease ${index * 0.15 + 0.1}s infinite`
        }} />
        <div style={{
          height: '12px', width: '65%', borderRadius: '4px',
          background: 'linear-gradient(90deg, #e2e8f0 0%, #f1f5f9 50%, #e2e8f0 100%)',
          backgroundSize: '200% 200%', animation: `widgetShimmer 1.8s ease ${index * 0.15 + 0.2}s infinite`
        }} />
      </div>
    </div>
    <div className="space-15" />
    <div className="border_black" style={{ opacity: 0.3 }} />
    <div className="space-15" />
  </div>
);

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
                  <span className="meta_separator">&bull;</span>
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
  const [imagesReady, setImagesReady] = useState(false);
  const { recentPosts, loading } = useData();

  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  // Preload images before showing
  useEffect(() => {
    if (recentPosts.length === 0) {
      setImagesReady(false);
      return;
    }
    setImagesReady(false);
    const urls = recentPosts.slice(0, 5).map(p => p.image).filter(Boolean);
    let loaded = 0;
    const total = urls.length;
    if (total === 0) { setImagesReady(true); return; }

    const done = () => { loaded++; if (loaded >= total) setImagesReady(true); };
    const timer = setTimeout(() => setImagesReady(true), 5000);

    urls.forEach(url => {
      const img = new Image();
      img.onload = done;
      img.onerror = done;
      img.src = url;
    });

    return () => clearTimeout(timer);
  }, [recentPosts]);

  const showSkeleton = loading || recentPosts.length === 0 || !imagesReady;

  return (
    <div className={`widget_tab md-mt-30 ${className ? className : ""}`} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Nav tabs>
        <NavItem>
          <Link
            to="/"
            className={classnames({ active: activeTab === "1" })}
            onClick={(e) => { e.preventDefault(); toggle("1"); }}
          >
            RÉCENTS
          </Link>
        </NavItem>
        <NavItem>
          <Link
            to="/"
            className={classnames({ active: activeTab === "2" })}
            onClick={(e) => { e.preventDefault(); toggle("2"); }}
          >
            POPULAIRES
          </Link>
        </NavItem>
      </Nav>

      {showSkeleton ? (
        <div className="widget tab_widgets" style={{ padding: '15px 0' }}>
          {[0, 1, 2, 3, 4].map(i => <SkeletonItem key={i} index={i} />)}
          <style>{`
            @keyframes widgetShimmer {
              0% { background-position: 200% 50%; }
              100% { background-position: -200% 50%; }
            }
          `}</style>
        </div>
      ) : (
        <TabContent activeTab={activeTab} style={{ animation: 'fadeInWidget 0.3s ease' }}>
          <TabPane tabId="1">
            <WidgetTabPane dark={dark} a_id={activeTab} id="1" arr={recentPosts.slice(0, 5)} />
          </TabPane>
          <TabPane tabId="2">
            <WidgetTabPane dark={dark} a_id={activeTab} id="2" arr={recentPosts.slice(0, 5)} />
          </TabPane>
        </TabContent>
      )}

      <style>{`
        @keyframes fadeInWidget {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default WidgetTab;

WidgetTab.propTypes = {
  className: ProtoTypes.string,
  dark: ProtoTypes.bool,
};
