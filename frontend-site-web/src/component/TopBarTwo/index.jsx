import React from "react";
import { Link } from "react-router-dom";
import FontAwesome from "../uiStyle/FontAwesome";
import Slider from "../Slider";

const TopBarTwo = () => {
  return (
    <div className="topbar white_bg" id="top">
      <div className="container">
        <div className="row">
          <div className="col-md-8 align-self-center">
            <div className="trancarousel_area" style={{ display: "flex" }}>
              <p className="trand">Tranding</p>
              <div className="trancarousel nav_style1" style={{ width: "80%" }}>
                <Slider
                  navigation={{
                    nextEl: ".swiper-button-next15",
                    prevEl: ".swiper-button-prev15",
                  }}
                  className="trancarousel"
                  slidesPerView={1}
                  loop={true}
                  autoplay={{
                    delay: 2500,
                    disableOnInteraction: false,
                  }}
                >
                  <div className="trancarousel_item">
                    <p>
                      <Link to="/">
                        Top 10 Best Movies of 2018 So Far: Great Movies To Watch
                        Now
                      </Link>
                    </p>
                  </div>
                  <div className="trancarousel_item">
                    <p>
                      <Link to="/">
                        Top 10 Best Movies of 2018 So Far: Great Movies To Watch
                        Now
                      </Link>
                    </p>
                  </div>
                  <div className="trancarousel_item">
                    <p>
                      <Link to="/">
                        Top 10 Best Movies of 2018 So Far: Great Movies To Watch
                        Now
                      </Link>
                    </p>
                  </div>
                </Slider>
                <div className="navBtns">
                  <button className="navBtn prevBtn swiper-button-prev15">
                    <FontAwesome name="angle-left" />
                  </button>
                  <button className="navBtn nextBtn swiper-button-next15">
                    <FontAwesome name="angle-right" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4 align-self-center">
            <div className="top_date_social text-right">
              <div className="social1">
                <ul className="inline">
                  <li>
                    <Link to="/">
                      <FontAwesome name="twitter" />
                    </Link>
                  </li>
                  <li>
                    <Link to="/">
                      <FontAwesome name="facebook-f" />
                    </Link>
                  </li>
                  <li>
                    <Link to="/">
                      <FontAwesome name="youtube-play" />
                    </Link>
                  </li>
                  <li>
                    <Link to="/">
                      <FontAwesome name="instagram" />
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="user3">
                <FontAwesome name="user-circle" />
              </div>
              <div className="lang-3">
                <Link to="#">
                  English <FontAwesome name="angle-down" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBarTwo;
