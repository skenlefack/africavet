import React from "react";
import feature21 from "../../assets/img/feature/feature-news-1.jpg";
import feature22 from "../../assets/img/feature/feature-news-2.jpg";
import feature23 from "../../assets/img/feature/feature-news-3.jpg";
import { Link } from "react-router-dom";
import Slider from "../Slider";
import FontAwesome from "../uiStyle/FontAwesome";

const feature_news = [
  {
    photo: feature21,
    category: "TECHNOLOGY",
    title:
      "The worried doctors stood together after their rounds, weighing the risks.",
  },
  {
    photo: feature22,
    category: "TECHNOLOGY",
    title:
      "Even healthy pregnant women are anxious. “They don’t feel the happiness.",
  },
  {
    photo: feature23,
    category: "TECHNOLOGY",
    title: "Ms. Anderson’s case has been particularly harrowing. She",
  },
  {
    photo: feature22,
    category: "TECHNOLOGY",
    title: "The worried doctors stood together “They don’t feel the.",
  },
  {
    photo: feature21,
    category: "TECHNOLOGY",
    title: "Even healthy pregnant women are anxious. “They don’t feel the.",
  },
  {
    photo: feature22,
    category: "TECHNOLOGY",
    title: "Ms. Anderson’s case has been particularly harrowing. She had",
  },
];

const FeatureNewsTwo = () => {
  return (
    <>
      <div className="feature3 mb30">
        <div className="row">
          <div className="col-12">
            <div className="heading padding20 white_bg mb20 border-radious5">
              <h3 className="widget-title margin0">Features</h3>
            </div>
          </div>
        </div>
        <div className="feature3_carousel owl-carousel nav_style1">
          <Slider
            navigation={{
              nextEl: ".swiper-button-next4",
              prevEl: ".swiper-button-prev4",
            }}
            slidesPerView={3}
            spaceBetween={25}
            breakpoints={{
              1024: {
                slidesPerView: 3,
                spaceBetween: 25,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 25,
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
            {feature_news.map((item, i) => (
              <div
                key={i}
                className="single_post type19 border-radious5 white_bg"
              >
                <div className="post_img">
                  <div className="img_wrap">
                    <Link to="/">
                      <img src={item.photo} alt="thumb" />
                    </Link>
                  </div>
                  <span className="batch3 date">{item.category}</span>
                </div>
                <div className="single_post_text padding20">
                  <p className="post-p">{item.title}</p>
                </div>
              </div>
            ))}
          </Slider>
          <div className="navBtns">
            <div className="navBtn prevtBtn swiper-button-prev4">
              <FontAwesome name="angle-left" />
            </div>
            <div className="navBtn nextBtn swiper-button-next4">
              <FontAwesome name="angle-right" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeatureNewsTwo;
