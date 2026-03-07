import React from "react";
import ProtoTypes from "prop-types";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/grid";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/free-mode";
import "swiper/css/thumbs";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Autoplay,
  Pagination,
  Navigation,
  EffectFade,
  Grid,
  Thumbs,
  FreeMode,
} from "swiper/modules";

function Slider({ children, ...props }) {
  // Convertir children en tableau de manière sécurisée
  const childrenArray = React.Children.toArray(children);

  // Si pas d'enfants, ne rien afficher
  if (!childrenArray || childrenArray.length === 0) {
    return null;
  }

  return (
    <Swiper
      {...props}
      modules={[
        Autoplay,
        Pagination,
        Navigation,
        EffectFade,
        Grid,
        Thumbs,
        FreeMode,
      ]}
    >
      {childrenArray.map((child, index) => (
        <SwiperSlide key={index + "swiper"}>{child}</SwiperSlide>
      ))}
    </Swiper>
  );
}

Slider.propTypes = {
  children: ProtoTypes.node,
};

export default Slider;
