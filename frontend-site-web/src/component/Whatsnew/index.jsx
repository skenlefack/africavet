import React from "react";
import ProtoTypes from "prop-types";
import { Link } from "react-router-dom";
import FontAwesome from "../uiStyle/FontAwesome";
import { mostViewSort } from "../../utils/commonFunctions";

// images
import whats21 from "../../assets/img/gallery-post/1.png";
import whats22 from "../../assets/img/gallery-post/2.png";
import whats23 from "../../assets/img/gallery-post/3.png";
import whats24 from "../../assets/img/gallery-post/4.png";
import whats25 from "../../assets/img/gallery-post/5.png";
import Slider from "../Slider";

const posts = [
  {
    image: whats21,
    category: "TECHNOLOGY",
    title: "Copa: Luis Suarez from devastated US",
  },
  {
    image: whats22,
    category: "TECHNOLOGY",
    title: "Copa: Luis Suarez from devastated US",
  },
  {
    image: whats23,
    category: "TECHNOLOGY",
    title: "Copa: Luis Suarez from devastated US",
  },
  {
    image: whats24,
    category: "TECHNOLOGY",
    title: "Copa: Luis Suarez from devastated US",
  },
  {
    image: whats25,
    category: "TECHNOLOGY",
    title: "Copa: Luis Suarez from devastated US",
  },
  {
    image: whats21,
    category: "TECHNOLOGY",
    title: "Copa: Luis Suarez from devastated US",
  },
  {
    image: whats22,
    category: "TECHNOLOGY",
    title: "Copa: Luis Suarez from devastated US",
  },
  {
    image: whats23,
    category: "TECHNOLOGY",
    title: "Copa: Luis Suarez from devastated US",
  },
  {
    image: whats24,
    category: "TECHNOLOGY",
    title: "Copa: Luis Suarez from devastated US",
  },
  {
    image: whats25,
    category: "TECHNOLOGY",
    title: "Copa: Luis Suarez from devastated US",
  },
  {
    image: whats21,
    category: "TECHNOLOGY",
    title: "Copa: Luis Suarez from devastated US",
  },
  {
    image: whats22,
    category: "TECHNOLOGY",
    title: "Copa: Luis Suarez from devastated US",
  },
  {
    image: whats23,
    category: "TECHNOLOGY",
    title: "Copa: Luis Suarez from devastated US",
  },
  {
    image: whats24,
    category: "TECHNOLOGY",
    title: "Copa: Luis Suarez from devastated US",
  },
  {
    image: whats25,
    category: "TECHNOLOGY",
    title: "Copa: Luis Suarez from devastated US",
  },
];

const Whatsnew = ({ className, title }) => {
  return (
    <div
      className={`${
        className ? className : "white_bg padding20 border-radious5 sm-mt30"
      }`}
    >
      <h2 className="widget-title">{title}</h2>
      <div className="popular_carousel multipleRowCarousel nav_style1">
        {/*CAROUSEL START*/}
        <Slider
          navigation={{
            nextEl: ".swiper-button-next18",
            prevEl: ".swiper-button-prev18",
          }}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          slidesPerView={1}
          grid={{
            rows: 6,
          }}
          loop={true}
        >
          {mostViewSort(posts).map((item, i) => (
            <div key={i} className="single_post type10 type16 widgets_small">
              <div className="post_img">
                <div className="img_wrap">
                  <Link to="/">
                    <img src={item.image} alt="thubm" />
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
                {i + 1 < posts.length ? (
                  <>
                    <div className="space-5" />
                    <div className="border_black" />
                    <div className="space-15" />
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </Slider>
        <div className="navBtns">
          <div className="navBtn prevtBtn swiper-button-prev18">
            <FontAwesome name="angle-left" />
          </div>
          <div className="navBtn nextBtn swiper-button-next18">
            <FontAwesome name="angle-right" />
          </div>
        </div>
        {/*CAROUSEL END*/}
      </div>
    </div>
  );
};

export default Whatsnew;

Whatsnew.propTypes = {
  className: ProtoTypes.string,
  title: ProtoTypes.string,
};
