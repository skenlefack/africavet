import React from "react";
import { Link } from "react-router-dom";
import FontAwesome from "../uiStyle/FontAwesome";

// images
import trends1 from "../../assets/img/gallery-post/1.png";
import trends2 from "../../assets/img/gallery-post/2.png";
import trends3 from "../../assets/img/gallery-post/3.png";
import trends4 from "../../assets/img/gallery-post/4.png";
import trends5 from "../../assets/img/gallery-post/5.png";

import { mostViewSort } from "../../utils/commonFunctions";
import Slider from "../Slider";

const trends = [
  {
    image: trends1,
    category: "TECHNOLOGY",
    date: "March 26, 2020",
    title: "Copa America: Luis Suarez from devastated US",
  },
  {
    image: trends2,
    category: "TECHNOLOGY",
    date: "March 26, 2020",
    title: "Copa America: Luis Suarez from devastated US",
  },
  {
    image: trends3,
    category: "TECHNOLOGY",
    date: "March 26, 2020",
    title: "Copa America: Luis Suarez from devastated US",
  },
  {
    image: trends4,
    category: "TECHNOLOGY",
    date: "March 26, 2020",
    title: "Copa America: Luis Suarez from devastated US",
  },
  {
    image: trends5,
    category: "TECHNOLOGY",
    date: "March 26, 2020",
    title: "Copa America: Luis Suarez from devastated US",
  },
  {
    image: trends1,
    category: "TECHNOLOGY",
    date: "March 26, 2020",
    title: "Copa America: Luis Suarez from devastated US",
  },
  {
    image: trends2,
    category: "TECHNOLOGY",
    date: "March 26, 2020",
    title: "Copa America: Luis Suarez from devastated US",
  },
  {
    image: trends3,
    category: "TECHNOLOGY",
    date: "March 26, 2020",
    title: "Copa America: Luis Suarez from devastated US",
  },
  {
    image: trends4,
    category: "TECHNOLOGY",
    date: "March 26, 2020",
    title: "Copa America: Luis Suarez from devastated US",
  },
  {
    image: trends5,
    category: "TECHNOLOGY",
    date: "March 26, 2020",
    title: "Copa America: Luis Suarez from devastated US",
  },
];

const TrendingCarousel = () => {
  return (
    <div className="popular_carousel multipleRowCarousel nav_style1">
      <Slider
        navigation={{
          nextEl: ".swiper-button-next16",
          prevEl: ".swiper-button-prev16",
        }}
        slidesPerView={1}
        grid={{
          rows: 6,
        }}
      >
        {mostViewSort(trends).map((item, i) => (
          <div
            key={i}
            className={`single_post type10 type16 widgets_small ${
              i + 2 < trends.length ? "mb15" : ""
            }`}
          >
            <div className="post_img">
              <div className="img_wrap">
                <Link to="/">
                  <img src={item.image} alt="thumb" />
                </Link>
              </div>
            </div>
            <div className="single_post_text">
              <h4>
                <Link to="/post1">{item.title}</Link>
              </h4>
              <div className="meta4">
                <Link to="/">{item.category}</Link>
              </div>
              {i + 2 < trends.length ? (
                <>
                  <div className="space-10" />
                  <div className="border_black" />
                  <div className="space-10" />
                </>
              ) : (
                ""
              )}
            </div>
          </div>
        ))}
      </Slider>
      <div className="navBtns">
        <div className="navBtn prevtBtn swiper-button-prev16">
          <FontAwesome name="angle-left" />
        </div>
        <div className="navBtn nextBtn swiper-button-next16">
          <FontAwesome name="angle-right" />
        </div>
      </div>
    </div>
  );
};

export default TrendingCarousel;
