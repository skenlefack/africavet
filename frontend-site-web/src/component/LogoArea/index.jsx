import React from "react";
import ProtoTypes from "prop-types";
import { Link } from "react-router-dom";
import logo from "../../assets/img/africavet-logo.png";
import logoDark from "../../assets/img/africavet-logo-dark.png";
import AdBanner from "../AdBanner";

const LogoArea = ({ className, dark }) => {
  return (
    <div className={`logo_area ${className ? className : ""}`}>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-3 col-md-4 align-self-center">
            <div className="logo" style={{ maxWidth: '180px' }}>
              <Link to="/">
                <img src={dark ? logoDark : logo} alt="AfricaVet" style={{ height: 'auto', maxHeight: '60px' }} />
              </Link>
            </div>
          </div>
          <div className="col-lg-9 col-md-8 align-self-center">
            {/* Encadré publicitaire Header - 650x85px */}
            {/* Position: header-banner - Géré dans le gestionnaire de publicités */}
            <div className="header-ad-wrapper" style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center'
            }}>
              <AdBanner
                placement="header-banner"
                className="header-ad"
                style={{
                  width: '650px',
                  height: '85px',
                  maxWidth: '100%',
                  overflow: 'hidden'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoArea;

LogoArea.propTypes = {
  className: ProtoTypes.string,
  dark: ProtoTypes.bool,
};
