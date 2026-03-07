import React from "react";
import ProtoTypes from "prop-types";
import { Link } from "react-router-dom";
import FontAwesome from "../uiStyle/FontAwesome";

// images
import sports2 from "../../assets/img/sports/sports-1.jpg";
import sports3 from "../../assets/img/sports/sports-2.jpg";
import sports4 from "../../assets/img/sports/sports-3.jpg";
import sports5 from "../../assets/img/sports/sports-4.jpg";
import sports6 from "../../assets/img/sports/sports-5.jpg";
import blog_small1 from "../../assets/img/sports/sports-1.jpg";
import blog_small2 from "../../assets/img/sports/sports-2.jpg";
import blog_small3 from "../../assets/img/sports/sports-3.jpg";
import blog_small4 from "../../assets/img/sports/sports-4.jpg";
import blog_small5 from "../../assets/img/sports/sports-5.jpg";

import { mostViewSort } from "../../utils/commonFunctions";
import Slider from "../Slider";

const mostView = [
  {
    image: sports2,
    category: "TECHNOLOGY",
    date: "March 26, 2020",
    title: "Nancy zhang a chinese busy woman and dhaka",
  },
  {
    image: sports3,
    category: "TECHNOLOGY",
    date: "March 26, 2020",
    title: "The billionaire Philan thropist read to learn",
  },
  {
    image: sports4,
    category: "TECHNOLOGY",
    date: "March 26, 2020",
    title: "Cheap smartphone sensor could help you",
  },
  {
    image: sports5,
    category: "TECHNOLOGY",
    date: "March 26, 2020",
    title: "Ratiffe to be Director of nation talent Trump",
  },
  {
    image: sports6,
    category: "TECHNOLOGY",
    date: "March 26, 2020",
    title: "Nancy zhang a chinese busy woman and dhaka",
  },
  {
    image: blog_small1,
    category: "TECHNOLOGY",
    date: "March 26, 2020",
    title: "The billionaire Philan thropist read to learn",
  },
  {
    image: blog_small2,
    category: "TECHNOLOGY",
    date: "March 26, 2020",
    title: "Nancy zhang a chinese busy woman and dhaka",
  },
  {
    image: blog_small3,
    category: "TECHNOLOGY",
    date: "March 26, 2020",
    title: "The billionaire Philan thropist read to learn",
  },
  {
    image: blog_small4,
    category: "TECHNOLOGY",
    date: "March 26, 2020",
    title: "Cheap smartphone sensor could help you",
  },
  {
    image: blog_small5,
    category: "TECHNOLOGY",
    date: "March 26, 2020",
    title: "Ratiffe to be Director of nation talent Trump",
  },
];

const SportsCarousel = ({ dark }) => {
  return (
    <div className="widget tab_widgets">
      <div className="post_type2_carousel multipleRowCarousel nav_style1">
        {/*CAROUSEL START*/}
        <Slider
          navigation={{
            nextEl: ".swiper-button-next13",
            prevEl: ".swiper-button-prev13",
          }}
          slidesPerView={1}
          grid={{
            rows: 6,
          }}
        >
          {mostViewSort(mostView).map((item, i) => (
            <div key={i} className="single_post2_carousel">
              <div className="single_post widgets_small">
                <div className="post_img">
                  <div className="img_wrap">
                    <Link to="/">
                      <img src={item.image} alt="thumb" />
                    </Link>
                  </div>
                  <span className="tranding">
                    <FontAwesome name="bolt" />
                  </span>
                </div>
                <div className="single_post_text">
                  <div className="meta2">
                    <Link to="/">{item.category}</Link>
                    <Link to="/">{item.date}</Link>
                  </div>
                  <h4>
                    <Link to="/post1">{item.title}</Link>
                  </h4>
                </div>
              </div>
              <div className="space-15" />
              {dark ? (
                <div className="border_white" />
              ) : (
                <div className="border_black" />
              )}
              <div className="space-15" />
            </div>
          ))}
        </Slider>
        <div className="navBtns">
          <div className="navBtn prevtBtn swiper-button-prev13">
            <FontAwesome name="angle-left" />
          </div>
          <div className="navBtn nextBtn swiper-button-next13">
            <FontAwesome name="angle-right" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SportsCarousel;

SportsCarousel.propTypes = {
  dark: ProtoTypes.bool,
};
