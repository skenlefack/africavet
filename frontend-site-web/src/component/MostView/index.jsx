import React from "react";
import ProtoTypes from "prop-types";
import { Link } from "react-router-dom";
import FontAwesome from "../uiStyle/FontAwesome";
import Slider from "../Slider";
import { useData } from "../../context/DataContext";

// Images par défaut
import mostsm1 from "../../assets/img/most-post/most-1.jpg";
import mostsm2 from "../../assets/img/most-post/most-2.jpg";
import mostsm3 from "../../assets/img/most-post/most-3.jpg";
import mostsm4 from "../../assets/img/most-post/most-4.jpg";
import mostsm5 from "../../assets/img/most-post/most-5.jpg";

const defaultMostView = [
  { id: 1, image: mostsm1, category: "Actualités", categorySlug: "news", date: "", title: "Chargement...", slug: "#" },
  { id: 2, image: mostsm2, category: "Actualités", categorySlug: "news", date: "", title: "Chargement...", slug: "#" },
  { id: 3, image: mostsm3, category: "Actualités", categorySlug: "news", date: "", title: "Chargement...", slug: "#" },
  { id: 4, image: mostsm4, category: "Actualités", categorySlug: "news", date: "", title: "Chargement...", slug: "#" },
  { id: 5, image: mostsm5, category: "Actualités", categorySlug: "news", date: "", title: "Chargement...", slug: "#" },
  { id: 6, image: mostsm1, category: "Actualités", categorySlug: "news", date: "", title: "Chargement...", slug: "#" },
];

// Fonction pour trier et ajouter un index
const mostViewSort = (arr) => {
  return arr.map((item, index) => ({
    ...item,
    rankId: index + 1,
  }));
};

const MostView = ({ no_margin, title, dark }) => {
  const { transformedPosts, loading } = useData();

  // Utiliser les données API ou fallback
  const rawData = transformedPosts.length > 0 ? transformedPosts.slice(0, 12) : defaultMostView;
  const mostView = mostViewSort(rawData);

  return (
    <div className={`widget tab_widgets ${no_margin ? "" : "mb30"}`}>
      <h2 className="widget-title">{title ? title : "Les Plus Vus"}</h2>
      <div className="post_type2_carousel multipleRowCarousel nav_style1">
        {/*CAROUSEL START*/}
        <Slider
          navigation={{
            nextEl: ".swiper-button-next8",
            prevEl: ".swiper-button-prev8",
          }}
          slidesPerView={1}
          grid={{
            rows: 6,
          }}
        >
          {mostView.map((item, i) => (
            <div key={item.id || i} className="single_post2_carousel">
              <div className="single_post widgets_small type8">
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
                <div className="type8_count">
                  <h2>{item.rankId}</h2>
                </div>
              </div>
              {i + 2 < mostView.length ? (
                <>
                  <div className="space-15" />
                  {dark ? (
                    <div className="border_white" />
                  ) : (
                    <div className="border_black" />
                  )}
                  <div className="space-15" />
                </>
              ) : null}
            </div>
          ))}
        </Slider>
        <div className="navBtns">
          <div className="navBtn prevtBtn swiper-button-prev8">
            <FontAwesome name="angle-left" />
          </div>
          <div className="navBtn nextBtn swiper-button-next8">
            <FontAwesome name="angle-right" />
          </div>
        </div>
        {/*CAROUSEL END*/}
      </div>
    </div>
  );
};

export default MostView;

MostView.propTypes = {
  no_margin: ProtoTypes.bool,
  title: ProtoTypes.string,
  dark: ProtoTypes.bool,
};
