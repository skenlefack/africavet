import React from "react";
import ProtoTypes from "prop-types";
import Heading from "../uiStyle/Heading";
import { Link } from "react-router-dom";
import Slider from "../Slider";
import FontAwesome from "../uiStyle/FontAwesome";
import { useData } from "../../context/DataContext";
import { useApp } from "../../context/AppContext";
import "./style.scss";

// Images par défaut
import fnewsImg2 from "../../assets/img/feature-2.jpg";
import fnewsImg3 from "../../assets/img/feature-3.jpg";
import fnewsImg4 from "../../assets/img/feature-4.jpg";

// Convertir hex en rgba
const hexToRgba = (hex, alpha = 0.7) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const defaultNews = [
  { id: 1, image: fnewsImg2, category: "Actualités", date: "", title: "Chargement...", slug: "#", categorySlug: "news" },
  { id: 2, image: fnewsImg3, category: "Actualités", date: "", title: "Chargement...", slug: "#", categorySlug: "news" },
  { id: 3, image: fnewsImg4, category: "Actualités", date: "", title: "Chargement...", slug: "#", categorySlug: "news" },
  { id: 4, image: fnewsImg2, category: "Actualités", date: "", title: "Chargement...", slug: "#", categorySlug: "news" },
];

const FeatureNews = ({ className }) => {
  const { featurePosts, loading } = useData();
  const { getCategoryColor } = useApp();

  // Utiliser les données API ou fallback
  const news = featurePosts.length > 0 ? featurePosts : defaultNews;

  return (
    <div className={`feature_carousel_area mb40 ${className ? className : ""}`}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <Heading title="À la Une" />
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            {/*CAROUSEL START*/}
            <div className="feature_carousel nav_style1">
              <Slider
                navigation={{
                  nextEl: ".swiper-button-next3",
                  prevEl: ".swiper-button-prev3",
                }}
                slidesPerView={4}
                spaceBetween={30}
                loop={true}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                }}
                breakpoints={{
                  1024: {
                    slidesPerView: 4,
                    spaceBetween: 30,
                  },
                  768: {
                    slidesPerView: 2,
                    spaceBetween: 30,
                  },
                  640: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                  },
                  320: {
                    slidesPerView: 1,
                    spaceBetween: 0,
                  },
                }}
              >
                {news.map((item, i) => (
                  <div key={item.id || i} className="single_post post_type6 post_type7">
                    <div className="post_img gradient1" style={{ '--category-gradient-color': hexToRgba(getCategoryColor(item.categorySlug || 'news'), 0.9) }}>
                      <Link to={`/article/${item.slug}`}>
                        <img src={item.image} alt={item.title} />
                      </Link>
                      <Link to={`/categorie/${item.categorySlug || 'news'}`} className="category_badge" style={{ backgroundColor: getCategoryColor(item.categorySlug || 'news') }}>
                        {item.category}
                      </Link>
                    </div>
                    <div className="single_post_text">
                      <h4>
                        <Link to={`/article/${item.slug}`}>{item.title}</Link>
                      </h4>
                      <span className="post_date">{item.date}</span>
                    </div>
                  </div>
                ))}
              </Slider>
              <div className="navBtns">
                <div className="navBtn prevtBtn swiper-button-prev3">
                  <FontAwesome name="angle-left" />
                </div>
                <div className="navBtn nextBtn swiper-button-next3">
                  <FontAwesome name="angle-right" />
                </div>
              </div>
            </div>
            {/*CAROUSEL END*/}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureNews;

FeatureNews.propTypes = {
  className: ProtoTypes.string,
};
