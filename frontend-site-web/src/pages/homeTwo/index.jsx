import React from "react";
import PostGalleryTwo from "../../component/PostGalleryTwo";
import TrendingNewsTwo from "../../component/TrendingNewsTwo";
import FeatureNewsTwo from "../../component/FeatureNewsTwo";
import BusinessNewsTwo from "../../component/BusinessNewsTwo";
import MostViewTwo from "../../component/MostViewTwo";
import banner2 from "../../assets/img/ad/ad-3.png";
import banner3 from "../../assets/img/ad/ad-1.png";
import WidgetFinance from "../../component/WidgetFinance";
import VideoNews from "../../component/VideoNews";
import WidgetTabTwo from "../../component/WidgetTabTwo";
import Opinion from "../../component/Opinion";
import Whatsnew from "../../component/Whatsnew";
import { Link } from "react-router-dom";
import NewsLetter from "../../component/NewsLetter";
import FollowUs from "../../component/FollowUs";
import MostViewThree from "../../component/MostViewThree";
import Sports from "../../component/Sports";
import International from "../../component/International";

function HomeTwo() {
  return (
    <>
      <PostGalleryTwo />
      <div className="total3 mb30">
        <div className="container">
          <div className="row">
            <div className="col-md-12 col-lg-8">
              <TrendingNewsTwo />
              <FeatureNewsTwo />
              <BusinessNewsTwo />
            </div>
            <div className="col-lg-4">
              <div className="row justify-content-center">
                <div className="col-md-6 col-lg-12">
                  <MostViewTwo />
                </div>
                <div className="col-md-6 col-lg-12 d-md-none d-lg-block">
                  <div className="banner2 mb30 border-radious5">
                    <Link to="/">
                      <img src={banner2} alt="thumb" />
                    </Link>
                  </div>
                </div>

                <div className="col-md-6 col-lg-12">
                  <WidgetFinance />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <VideoNews />
      <div className="mix3 mb30">
        <div className="container">
          <div className="row">
            <div className="col-md-6 col-xl-3">
              <WidgetTabTwo className="sm-mt0 md-mt0" />
            </div>
            <div className="col-md-6 col-xl-5 d-lg-none d-xl-block">
              <Opinion />
            </div>
            <div className="col-lg-6 col-xl-4">
              <Whatsnew title="Whats new" />
            </div>
          </div>
        </div>
      </div>
      <div className="mix_elements">
        <div className="container">
          <div className="row">
            <div className="col-xl-8 col-md-12">
              <div className="banner_area mb30 xs-mt60">
                <Link to="/">
                  <img src={banner3} alt="banner3" />
                </Link>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <NewsLetter className="white_bg border-radious5" />
                  <Sports />
                </div>
                <div className="col-md-6">
                  <MostViewThree />
                </div>
              </div>
            </div>
            <div className="col-xl-4 d-md-none d-xl-block col-md-12">
              <div className="row">
                <div className="col-md-6 col-lg-12">
                  <FollowUs
                    title="Contact Us"
                    className="border-radious5 white_bg padding20 sm-mt30"
                  />
                </div>
                <div className="col-md-6 col-lg-12">
                  <International />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="space-70" />
    </>
  );
}

export default HomeTwo;
