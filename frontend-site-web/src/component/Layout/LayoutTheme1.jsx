import React, { useEffect, useRef } from "react";
import ProtoTypes from "prop-types";
import TopBar from "../../component/TopBar";
import LogoArea from "../../component/LogoArea";
import MainMenu from "../../component/MainMenu";
import FooterArea from "../../component/FooterArea";
import { Outlet, useLocation } from "react-router-dom";
import ScrollTopButton from "../ScrollTopButton";

const API_URL = import.meta.env.VITE_API_URL || "/api";

// Generate or retrieve persistent visitor ID
const getVisitorId = () => {
  let id = localStorage.getItem('av_visitor_id');
  if (!id) {
    id = 'v_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('av_visitor_id', id);
  }
  return id;
};

// Session ID (per tab session)
const sessionId = 's_' + Math.random().toString(36).substring(2) + Date.now().toString(36);

const PageTracker = () => {
  const location = useLocation();
  const lastTracked = useRef('');

  useEffect(() => {
    const fullPath = location.pathname + location.search;
    if (fullPath === lastTracked.current) return;
    lastTracked.current = fullPath;

    // Determine page type from URL
    let pageType = 'other';
    if (fullPath === '/') pageType = 'home';
    else if (fullPath.startsWith('/article/')) pageType = 'article';
    else if (fullPath.startsWith('/categorie/')) pageType = 'category';
    else if (fullPath.startsWith('/opportunites')) pageType = 'opportunity';
    else if (fullPath.startsWith('/formations') || fullPath.startsWith('/cours/')) pageType = 'elearning';
    else if (fullPath.startsWith('/annuaire')) pageType = 'annuaire';

    const data = {
      page_url: fullPath,
      page_title: document.title,
      page_type: pageType,
      referrer_url: document.referrer || null,
      visitor_id: getVisitorId(),
      session_id: sessionId,
    };

    fetch(`${API_URL}/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {});
  }, [location]);

  return null;
};

const LayoutTheme1 = ({ children }) => {
  return (
    <div className="theme-1">
      <PageTracker />
      <ScrollTopButton />
      <TopBar className="white_bg" />
      <div className="border_black" />
      <LogoArea className="white_bg" />
      <MainMenu />
      <Outlet />
      {children}
      <FooterArea />
    </div>
  );
};
export default LayoutTheme1;

LayoutTheme1.propTypes = {
  children: ProtoTypes.node,
};
