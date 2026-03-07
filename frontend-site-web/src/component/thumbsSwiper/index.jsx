import React, { useState } from "react";
import Slider from "../Slider";
import FontAwesome from "../uiStyle/FontAwesome";
import { Link } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { useApp } from "../../context/AppContext";

// Convertir hex en rgba
const hexToRgba = (hex, alpha = 0.7) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Images par défaut
import gsil1 from "../../assets/img/gallery-post/item-1.jpg";
import gsil2 from "../../assets/img/gallery-post/item-2.jpg";
import gsil3 from "../../assets/img/gallery-post/item-3.jpg";
import gsil4 from "../../assets/img/gallery-post/item-4.jpg";
import gsil5 from "../../assets/img/gallery-post/item-5.jpg";
import sliderImg1 from "../../assets/img/gallery-post.jpg";

const defaultThumbs = [gsil1, gsil2, gsil3, gsil4, gsil5, gsil1, gsil2, gsil3, gsil4];
const defaultSlider = [
  {
    id: 1,
    image: sliderImg1,
    title: "Chargement des articles...",
    body: "Veuillez patienter pendant le chargement des derniers articles.",
    category: "Actualités",
    categorySlug: "news",
    date: "",
    slug: "#"
  },
];

function ThumbsSwiper() {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const { galleryPosts, loading } = useData();
  const { getCategoryColor } = useApp();

  // Utiliser les données API ou fallback
  const postSlider = galleryPosts.length > 0 ? galleryPosts : defaultSlider;
  const thumbs = postSlider.length > 0 ? postSlider.map(p => p.image) : defaultThumbs;

  return (
    <div className="thumbs_swiper_wrapper">
      <div className="slider_demo2">
        <Slider
          loop={true}
          spaceBetween={10}
          thumbs={{
            swiper:
              thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
          }}
          slidesPerView={1}
          navigation={{
            nextEl: ".swiper-button-next-thumbs",
            prevEl: ".swiper-button-prev-thumbs",
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
        >
          {postSlider.slice(0, 9).map((item, i) => (
            <div key={item.id || i} className="single_post post_type6 xs-mb30">
              <div className="post_img gradient1" style={{ '--category-gradient-color': hexToRgba(getCategoryColor(item.categorySlug || 'news'), 0.9) }}>
                <img src={item.image} alt={item.title} />
                <Link to={`/categorie/${item.categorySlug || 'news'}`} className="category_badge" style={{ backgroundColor: getCategoryColor(item.categorySlug || 'news') }}>
                  {item.category}
                </Link>
                <span className="tranding">
                  <FontAwesome name="play" />
                </span>
              </div>
              <div className="single_post_text">
                <h4>
                  <Link className="play_btn" to={`/article/${item.slug}`}>
                    {item.title}
                  </Link>
                </h4>
                <p className="post-p">{item.body}</p>
                <span className="post_date">{item.date}</span>
              </div>
            </div>
          ))}
        </Slider>
      </div>
      <div className="slider_demo1">
        <div className="slider_arrow arrow_left slick-arrow swiper-button-prev-thumbs">
          <FontAwesome name="angle-left" />
        </div>
        <Slider
          onSwiper={setThumbsSwiper}
          loop={true}
          spaceBetween={10}
          slidesPerView={4}
          freeMode={true}
          watchSlidesProgress={true}
          breakpoints={{
            1024: {
              slidesPerView: 8,
            },
            768: {
              slidesPerView: 5,
            },
            320: {
              slidesPerView: 3,
            },
          }}
        >
          {thumbs.slice(0, 9).map((item, i) => (
            <div key={i} className="single_gallary_item">
              <img src={item} alt="thumb" />
            </div>
          ))}
        </Slider>
        <div className="slider_arrow arrow_right slick-arrow swiper-button-next-thumbs">
          <FontAwesome name="angle-right" />
        </div>
      </div>
    </div>
  );
}

export default ThumbsSwiper;
