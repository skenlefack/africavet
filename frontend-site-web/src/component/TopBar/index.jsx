import React, { useState } from "react";
import ProtoTypes from "prop-types";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import FontAwesome from "../uiStyle/FontAwesome";
import Slider from "../Slider";
import SearchModal from "../SearchModal";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../shared/NotificationBell";
import UserMenu from "../auth/UserMenu";
import LanguageSwitcher from "../LanguageSwitcher";

const TopBar = ({ className, dark }) => {
  const [searchShow, setSearchShow] = useState(false);
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  return (
    <>
      <div className={`topbar ${className ? className : ""}`} id="top">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-md-8 align-self-center">
              <div
                className={`trancarousel_area ${dark ? "white" : ""}`}
                style={{ display: "flex" }}
              >
                <p className="trand">{t('home.trendingNow')}</p>
                <div className="nav_style1" style={{ width: "80%" }}>
                  <Slider
                    navigation={{
                      nextEl: ".swiper-button-next14",
                      prevEl: ".swiper-button-prev14",
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
                          {t('home.carousel1')}
                        </Link>
                      </p>
                    </div>
                    <div className="trancarousel_item">
                      <p>
                        <Link to="/">
                          {t('home.carousel2')}
                        </Link>
                      </p>
                    </div>
                    <div className="trancarousel_item">
                      <p>
                        <Link to="/">
                          {t('home.carousel3')}
                        </Link>
                      </p>
                    </div>
                  </Slider>
                  <div className="navBtns">
                    <button className="navBtn prevBtn swiper-button-prev14">
                      <FontAwesome name="angle-left" />
                    </button>
                    <button className="navBtn nextBtn swiper-button-next14">
                      <FontAwesome name="angle-right" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-4 align-self-center">
              <div className="top_date_social text-right d-flex align-items-center justify-content-end">
                <div className={`social1 ${dark ? "white" : ""}`}>
                  <ul className="inline">
                    <li>
                      <a href="https://www.facebook.com/africavetwebportail/" target="_blank" rel="noopener noreferrer">
                        <FontAwesome name="facebook-f" />
                      </a>
                    </li>
                    <li>
                      <a href="https://x.com/africavet" target="_blank" rel="noopener noreferrer">
                        <FontAwesome name="twitter" />
                      </a>
                    </li>
                    <li>
                      <a href="https://whatsapp.com/channel/0029Vb7GhhAKrWR4oDYbAS3U" target="_blank" rel="noopener noreferrer">
                        <FontAwesome name="whatsapp" />
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="topbar_separator d-none d-lg-block"></div>
                <div className={`topbar_search d-none d-lg-block ${dark ? "white" : ""}`}>
                  <button onClick={() => setSearchShow(!searchShow)} aria-label={t('common.search')}>
                    <FontAwesome name="search" />
                  </button>
                </div>
                <div className={`topbar_lang d-none d-lg-block ${dark ? "white" : ""}`} style={{ marginLeft: 8 }}>
                  <LanguageSwitcher />
                </div>
                <div className="topbar_separator d-none d-lg-block"></div>
                <div className="d-none d-lg-flex align-items-center topbar_auth">
                  {isAuthenticated ? (
                    <>
                      <NotificationBell />
                      <UserMenu />
                    </>
                  ) : (
                    <>
                      <Link to="/connexion" className="topbar_auth_btn" aria-label={t('nav.login')} data-tooltip={t('nav.login')}>
                        <i className="fa fa-sign-in" />
                      </Link>
                      <Link to="/inscription" className="topbar_auth_btn topbar_auth_btn--primary" aria-label={t('nav.register')} data-tooltip={t('nav.register')}>
                        <i className="fa fa-user-plus" />
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {searchShow && (
        <SearchModal setSearchShow={setSearchShow} searchShow={searchShow} />
      )}
    </>
  );
};

export default TopBar;

TopBar.propTypes = {
  className: ProtoTypes.string,
  dark: ProtoTypes.bool,
};
