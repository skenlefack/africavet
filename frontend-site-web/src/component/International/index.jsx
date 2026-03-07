import React from "react";
import most21 from "../../assets/img/international-post-thumb.jpg";
import FontAwesome from "../uiStyle/FontAwesome";
import { Link } from "react-router-dom";

const posts = [
  {
    photo: most21,
    author: "QuomodoSoft",
    category: "Technology",
    title: "Copa America: Luis Suarez from devastated US",
    description:
      "The property, complete with seat screening from room, a 100-seat amphitheater and a swimming pond with sandy",
  },
  {
    photo: most21,
    author: "QuomodoSoft",
    category: "Technology",
    title: "Copa America: Luis Suarez from devastated US",
    description:
      "The property, complete with seat screening from room, a 100-seat amphitheater and a swimming pond with sandy",
  },
  {
    photo: most21,
    author: "QuomodoSoft",
    category: "Technology",
    title: "Copa America: Luis Suarez from devastated US",
    description:
      "The property, complete with seat screening from room, a 100-seat amphitheater and a swimming pond with sandy",
  },
  {
    photo: most21,
    author: "QuomodoSoft",
    category: "Technology",
    title: "Copa America: Luis Suarez from devastated US",
    description:
      "The property, complete with seat screening from room, a 100-seat amphitheater and a swimming pond with sandy",
  },
];
const International = () => {
  return (
    <div className="international_news white_bg padding20 border-radious5 sm-mt30">
      <h3 className="widget-title">International</h3>
      {posts.map((item, i) => (
        <div key={i}>
          <div className="single_international">
            <p className="meta before">{item.category}</p>
            <h4>
              <Link to="/post1">{item.title}</Link>
            </h4>
            <div className="space-10" />
            <div className="view_author">
              <FontAwesome name="user-circle mr-1" />
              <Link to="/">{item.author}</Link>
            </div>
            <div className="space-5" />
            <div className="row">
              <div className="col-8 align-self-center">
                <p>{item.description}</p>
              </div>
              <div className="col-4 align-self-center">
                <div className="img_wrap">
                  <Link to="/">
                    <img src={item.photo} alt="thumb" />
                  </Link>
                </div>
              </div>
            </div>
            <ul className="mt20 like_cm">
              <li>
                <Link to="/">
                  <FontAwesome name="eye" /> 6745
                </Link>
              </li>
              <li>
                <Link to="/">
                  <FontAwesome name="heart" /> 6745
                </Link>
              </li>
              <li>
                <Link to="/">
                  <FontAwesome name="share" /> 6745
                </Link>
              </li>
            </ul>
          </div>
          {i + 1 < posts.length ? (
            <>
              <div className="space-5" />
              <div className="border_black" />
              <div className="space-15" />
            </>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default International;
