import React from "react";
import ProtoTypes from "prop-types";
import { Link } from "react-router-dom";
import FontAwesome from "../uiStyle/FontAwesome";
import Slider from "../Slider";
import { useData } from "../../context/DataContext";

// Images par défaut
import hside1 from "../../assets/img/post-1.jpg";
import hside2 from "../../assets/img/post-2.jpg";
import hside3 from "../../assets/img/post-3.jpg";

const defaultSlider = [
  { id: 1, title: "Chargement des articles...", body: "", image: hside1, slug: "#", date: "", category: "Actualités", categorySlug: "news" },
  { id: 2, title: "Chargement des articles...", body: "", image: hside2, slug: "#", date: "", category: "Actualités", categorySlug: "news" },
  { id: 3, title: "Chargement des articles...", body: "", image: hside3, slug: "#", date: "", category: "Actualités", categorySlug: "news" },
];

const PostCarousel = ({ className }) => {
  const { sliderPosts, loading } = useData();

  // Utiliser les données API ou fallback
  const postSlider = sliderPosts.length > 0 ? sliderPosts : defaultSlider;

  return (
    <div className={className ? className : ""}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="carousel_posts1 owl-carousel nav_style2 mb40 mt30">
              {/*CAROUSEL START*/}
              <div className="px-4 position-relative">
                <Slider
                  navigation={{
                    nextEl: ".swiper-button-next11",
                    prevEl: ".swiper-button-prev11",
                  }}
                  className="trancarousel"
                  slidesPerView={3}
                  spaceBetween={20}
                  loop={true}
                  autoplay={{
                    delay: 4000,
                    disableOnInteraction: false,
                  }}
                  breakpoints={{
                    1024: {
                      slidesPerView: 3,
                      spaceBetween: 20,
                    },
                    768: {
                      slidesPerView: 2,
                      spaceBetween: 20,
                    },
                    640: {
                      slidesPerView: 2,
                      spaceBetween: 20,
                    },
                    320: {
                      slidesPerView: 1,
                      spaceBetween: 20,
                    },
                  }}
                >
                  {postSlider.map((item, i) => (
                    <div
                      key={item.id || i}
                      className="single_post widgets_small post_type5"
                    >
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
                            {item.category || 'Actualités'}
                          </Link>
                          <span className="meta_separator">•</span>
                          <span className="post_date">{item.date}</span>
                        </div>
                        <h4>
                          <Link to={`/article/${item.slug}`}>{item.title}</Link>
                        </h4>
                      </div>
                    </div>
                  ))}
                </Slider>
                <div className="owl-nav">
                  <div className="owl-prev swiper-button-prev11">
                    <FontAwesome name="angle-left" />
                  </div>
                  <div className="owl-next swiper-button-next11">
                    <FontAwesome name="angle-right" />
                  </div>
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

export default PostCarousel;

PostCarousel.propTypes = {
  className: ProtoTypes.string,
};
