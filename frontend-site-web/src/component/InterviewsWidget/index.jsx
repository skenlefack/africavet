import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import FontAwesome from "../uiStyle/FontAwesome";
import { postsApi, getImageUrl as resolveImageUrl } from "../../services/api";
import "./style.scss";

import defaultImg from "../../assets/img/post-1.jpg";

const InterviewsWidget = ({ limit = 5, categorySlug = "news", title = "Dernières Interviews" }) => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInterviews();
  }, [categorySlug]);

  const loadInterviews = async () => {
    try {
      const response = await postsApi.getByCategory(categorySlug, 1, limit);
      if (response.success) {
        setInterviews(response.data || []);
      }
    } catch (error) {
      console.error("Error loading interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => resolveImageUrl(path, defaultImg);

  const truncate = (text, maxLength) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  if (loading) {
    return (
      <div className="interviews-widget">
        <div className="interviews-widget-header">
          <h3 className="interviews-widget-title">
            <FontAwesome name="microphone" /> {title}
          </h3>
        </div>
        <div className="interviews-loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (interviews.length === 0) return null;

  return (
    <div className="interviews-widget">
      <div className="interviews-widget-header">
        <h3 className="interviews-widget-title">
          <FontAwesome name="microphone" /> {title}
        </h3>
        <Link to={`/categorie/${categorySlug}`} className="interviews-see-all">
          Voir tout <FontAwesome name="angle-right" />
        </Link>
      </div>

      <div className="interviews-list">
        {interviews.map((interview, index) => (
          <Link
            key={interview.id}
            to={`/article/${interview.slug}`}
            className={`interview-item ${index === 0 ? "interview-featured" : ""}`}
          >
            <div className="interview-avatar">
              <img
                src={getImageUrl(interview.featured_image)}
                alt={interview.title_fr || interview.title}
              />
              <span className="interview-icon">
                <FontAwesome name="microphone" />
              </span>
            </div>
            <div className="interview-info">
              <h4 className="interview-title">
                {truncate(interview.title_fr || interview.title, index === 0 ? 60 : 45)}
              </h4>
              {index === 0 && interview.excerpt_fr && (
                <p className="interview-excerpt">
                  {truncate(interview.excerpt_fr || interview.excerpt, 80)}
                </p>
              )}
              <span className="interview-date">
                <FontAwesome name="clock-o" />{" "}
                {new Date(interview.created_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
            <div className="interview-play">
              <FontAwesome name="play" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default InterviewsWidget;
