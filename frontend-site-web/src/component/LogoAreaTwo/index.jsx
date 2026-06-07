import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/img/africavet-logo.png";
import tempIcon from "../../assets/img/icon/temp.png";

const LogoAreaTwo = () => {
  const [search, setSearch] = useState("");
  const submitHandler = (e) => {
    e.preventDefault();
    setSearch("");
  };
  return (
    <div className="logo_area white_bg">
      <div className="container">
        <div className="row">
          <div className="col-lg-3 align-self-center">
            <div className="logo">
              <Link to="/">
                <img src={logo} alt="AfricaVET" style={{ maxHeight: '70px', height: 'auto' }} />
              </Link>
            </div>
          </div>
          <div className="col-lg-6 align-self-center">
            <div className="signup_form header_search3">
              <form onSubmit={submitHandler}>
                <input
                  className="signup"
                  type="email"
                  placeholder="Your email address"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit" className="cbtn">
                  sign up
                </button>
              </form>
            </div>
          </div>
          <div className="col-lg-2 align-self-center offset-lg-1">
            <div className="temp d-none d-lg-block">
              <div className="temp_wap">
                <div className="temp_icon">
                  <img src={tempIcon} alt="icon" />
                </div>
                <h3 className="temp_count">13</h3>
                <p>San Francisco</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoAreaTwo;
