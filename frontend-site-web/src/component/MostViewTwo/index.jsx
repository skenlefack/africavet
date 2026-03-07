import React from "react";
import ProtoTypes from "prop-types";
import { Link } from "react-router-dom";
import FontAwesome from "../uiStyle/FontAwesome";

// images
import mostsm1 from "../../assets/img/most-post/most-1.jpg";
import mostsm2 from "../../assets/img/most-post/most-2.jpg";
import mostsm3 from "../../assets/img/most-post/most-3.jpg";
import mostsm4 from "../../assets/img/most-post/most-4.jpg";
import mostsm5 from "../../assets/img/most-post/most-5.jpg";
import { mostViewSort } from "../../utils/commonFunctions";
import Slider from "../Slider";

const mostView = [
  {
    image: mostsm1,
    category: "TECHNOLOGY",
    date: "March 26, 2020",
    title: "Nancy zhang a chinese busy woman and dhaka",
  },
  {
    image: mostsm2,
    category: "TECHNOLOGY",
    date: "March 26, 2020",
    title: "The billionaire Philan thropist read to learn",
  },
  {
    image: mostsm3,
    category: "TECHNOLOGY",
    date: "March 26, 2020",
    title: "Cheap smartphone sensor could help you",
  },
  {
    image: mostsm4,
    category: "TECHNOLOGY",
    date: "March 26, 2020",
    title: "Ratiffe to be Director of nation talent Trump",
  },
  {
    image: mostsm5,
    category: "TECHNOLOGY",
    date: "March 26, 2020",
    title: "Nancy zhang a chinese busy woman and dhaka",
  },
  {
    image: mostsm1,
    category: "TECHNOLOGY",
    date: "March 26, 2020",
    title: "The billionaire Philan thropist read to learn",
  },
  {
    image: mostsm1,
    category: "TECHNOLOGY",
    date: "March 26, 2020",
    title: "Nancy zhang a chinese busy woman and dhaka",
  },
  {
    image: mostsm2,
    category: "TECHNOLOGY",
    date: "March 26, 2020",
    title: "The billionaire Philan thropist read to learn",
  },
  {
    image: mostsm3,
    category: "TECHNOLOGY",
    date: "March 26, 2020",
    title: "Cheap smartphone sensor could help you",
  },
  {
    image: mostsm4,
    category: "TECHNOLOGY",
    date: "March 26, 2020",
    title: "Ratiffe to be Director of nation talent Trump",
  },
];

const MostViewTwo = ({ title }) => {
  return (
    <div className="most_widget3 padding20 white_bg border-radious5 mb30 sm-mt30">
      <div className="heading">
        <h2 className="widget-title">{title ? title : "Most View"}</h2>
      </div>
      <div className="post_type2_carousel multipleRowCarousel pt12_wrapper nav_style1">
        {/*CAROUSEL START*/}
        <Slider
          navigation={{
            nextEl: ".swiper-button-next9",
            prevEl: ".swiper-button-prev9",
          }}
          slidesPerView={1}
          grid={{
            rows: 6,
          }}
        >
          {mostViewSort(mostView).map((item, i) => (
            <div key={i} className="single_post widgets_small type8 type17">
              <div className="post_img">
                <div className="img_wrap">
                  <Link to="/">
                    <img src={item.image} alt="thumb" />
                  </Link>
                </div>
                <span className="tranding tranding_border">{item.id}</span>
              </div>
              <div className="single_post_text">
                <h4>
                  <Link to="/post1">{item.title}</Link>
                </h4>
                <div className="meta2">
                  <Link to="/">{item.category}</Link>
                  <Link to="/">{item.date}</Link>
                </div>
                {i + 2 < mostView.length ? (
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
          <div className="navBtn prevtBtn swiper-button-prev9">
            <FontAwesome name="angle-left" />
          </div>
          <div className="navBtn nextBtn swiper-button-next9">
            <FontAwesome name="angle-right" />
          </div>
        </div>
        {/*CAROUSEL END*/}
      </div>
    </div>
  );
};

export default MostViewTwo;

MostViewTwo.propTypes = {
  title: ProtoTypes.string,
};
