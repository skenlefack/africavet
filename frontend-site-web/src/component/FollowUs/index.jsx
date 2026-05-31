import React from "react";
import ProtoTypes from "prop-types";
import FontAwesome from "../uiStyle/FontAwesome";

const socials = [
  {
    name: "facebook-f",
    label: "Facebook",
    url: "https://www.facebook.com/africavetwebportail",
    className: "social_facebook",
    count: "12K+",
    countLabel: "Fans",
  },
  {
    name: "twitter",
    label: "X (Twitter)",
    url: "https://x.com/africavet",
    className: "social_twitter",
    count: "8K+",
    countLabel: "Followers",
  },
  {
    name: "linkedin",
    label: "LinkedIn",
    url: "https://be.linkedin.com/in/africavet-v%C3%A9t%C3%A9rinaire-4b43a920",
    className: "social_instagram",
    count: "5K+",
    countLabel: "Connexions",
  },
];

const FollowUs = ({ className = "", title }) => {
  return (
    <div className={`follow_box widget mb30 ${className}`}>
      <h2 className="widget-title">{title}</h2>
      <div className="social_shares">
        {socials.map((s, i) => (
          <a
            key={i}
            className={`single_social ${s.className}`}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="follow_icon">
              <FontAwesome name={s.name} />
            </span>
            {s.count} <span className="icon_text">{s.countLabel}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default FollowUs;

FollowUs.propTypes = {
  className: ProtoTypes.string,
  title: ProtoTypes.string,
};
