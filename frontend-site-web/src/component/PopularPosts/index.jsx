import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import FontAwesome from "../uiStyle/FontAwesome";
import { postsApi, getImageUrl as resolveImageUrl } from "../../services/api";

import "./style.scss";
import Slider from "../Slider";

// Images par défaut
import defaultImg from "../../assets/img/post-1.jpg";

const PopularPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await postsApi.getLatest(10);
      if (response.success) {
        setPosts(response.data || []);
      }
    } catch (error) {
      console.error('Error loading popular posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => resolveImageUrl(path, defaultImg);

  const truncate = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Ajouter un index de rang
  const rankedPosts = posts.map((post, index) => ({
    ...post,
    rankId: index + 1
  }));

  if (loading || posts.length === 0) {
    return null;
  }

  return (
    <div className="popular_carousel_area mb30 md-mt-30">
      <h2 className="widget-title">Articles Populaires</h2>
      <div className="popular_carousel pt-15 multipleRowCarousel nav_style1">
        {/*CAROUSEL START*/}
        <Slider
          navigation={{
            nextEl: ".swiper-button-next10",
            prevEl: ".swiper-button-prev10",
          }}
          loop={true}
          slidesPerView={1}
          grid={{
            rows: 5,
          }}
        >
          {rankedPosts.map((item) => (
            <div key={item.id} className="single_post type10 widgets_small mb15">
              <div className="post_img">
                <div className="img_wrap">
                  <Link to={`/article/${item.slug}`}>
                    <img src={getImageUrl(item.featured_image)} alt={item.title_fr || item.title} />
                  </Link>
                </div>
                <span className="tranding tranding_border">{item.rankId}</span>
              </div>
              <div className="single_post_text">
                <div className="meta_info">
                  <Link to={`/categorie/${item.category_slug || 'news'}`} className="category_label">
                    {item.category_name || 'Actualités'}
                  </Link>
                  <span className="meta_separator">•</span>
                  <span className="post_date">{item.date || ''}</span>
                </div>
                <h4>
                  <Link to={`/article/${item.slug}`}>
                    {truncate(item.title_fr || item.title, 50)}
                  </Link>
                </h4>
              </div>
            </div>
          ))}
        </Slider>
        <div className="navBtns">
          <div className="navBtn prevtBtn swiper-button-prev10">
            <FontAwesome name="angle-left" />
          </div>
          <div className="navBtn nextBtn swiper-button-next10">
            <FontAwesome name="angle-right" />
          </div>
        </div>
        {/*CAROUSEL END*/}
      </div>
    </div>
  );
};

export default PopularPosts;
