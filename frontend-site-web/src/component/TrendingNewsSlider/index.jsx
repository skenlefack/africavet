import React from "react";
import FontAwesome from "../uiStyle/FontAwesome";
import { Link } from "react-router-dom";
import Slider from "../Slider";
import { useData } from "../../context/DataContext";
import { useApp } from "../../context/AppContext";

// Images par défaut
import trendbig1 from "../../assets/img/trending-news-1.jpg";
import trendbig2 from "../../assets/img/trending-news-2.jpg";

const defaultNews = [
  {
    id: 1,
    category: "Actualités",
    categorySlug: "news",
    date: "",
    title: "Chargement des articles...",
    body: "Veuillez patienter pendant le chargement.",
    image: trendbig1,
    slug: "#"
  },
  {
    id: 2,
    category: "Actualités",
    categorySlug: "news",
    date: "",
    title: "Chargement des articles...",
    body: "Veuillez patienter pendant le chargement.",
    image: trendbig2,
    slug: "#"
  },
];

const TrendingNewsSlider = () => {
  const { trendingPosts, loading } = useData();
  const { getCategoryColor } = useApp();

  // Utiliser les données API ou fallback
  const trendingNews = trendingPosts.length > 0 ? trendingPosts.slice(0, 3) : defaultNews;

  return (
    <div className="carousel_post2_type3 nav_style1">
      <Slider
        className="trancarousel"
        slidesPerView={2}
        spaceBetween={20}
        loop={true}
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
        }}
        navigation={{
          nextEl: ".swiper-button-next17",
          prevEl: ".swiper-button-prev17",
        }}
        breakpoints={{
          1024: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 1,
            spaceBetween: 20,
          },
          300: {
            slidesPerView: 1,
            spaceBetween: 20,
          },
        }}
      >
        {trendingNews.map((item, i) => (
          <div key={item.id || i} className="single_post post_type3">
            <div className="post_img">
              <div className="img_wrap">
                <img src={item.image} alt={item.title} />
              </div>
              <Link to={`/categorie/${item.categorySlug || 'news'}`} className="category_badge" style={{ backgroundColor: getCategoryColor(item.categorySlug || 'news') }}>
                {item.category}
              </Link>
              <span className="tranding">
                <FontAwesome name="bolt" />
              </span>
            </div>
            <div className="single_post_text">
              <h4>
                <Link to={`/article/${item.slug}`}>{item.title}</Link>
              </h4>
              <p className="post-p">{item.body}</p>
              <span className="post_date">{item.date}</span>
            </div>
          </div>
        ))}
      </Slider>
      <div className="navBtns">
        <div className="navBtn prevtBtn swiper-button-prev17">
          <FontAwesome name="angle-left" />
        </div>
        <div className="navBtn nextBtn swiper-button-next17">
          <FontAwesome name="angle-right" />
        </div>
      </div>
    </div>
  );
};

export default TrendingNewsSlider;
