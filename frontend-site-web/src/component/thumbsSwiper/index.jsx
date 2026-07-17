import React, { useState, useEffect } from "react";
import Slider from "../Slider";
import FontAwesome from "../uiStyle/FontAwesome";
import { Link } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { useApp } from "../../context/AppContext";

const hexToRgba = (hex, alpha = 0.7) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Preload images and resolve when all are loaded (or timeout)
const preloadImages = (urls, timeout = 6000) => {
  return new Promise((resolve) => {
    let loaded = 0;
    const total = urls.length;
    if (total === 0) { resolve(); return; }

    const done = () => { loaded++; if (loaded >= total) resolve(); };
    const timer = setTimeout(resolve, timeout);

    urls.forEach((url) => {
      if (!url) { done(); return; }
      const img = new Image();
      img.onload = done;
      img.onerror = done;
      img.src = url;
    });
  });
};

const SliderSkeleton = () => (
  <div className="thumbs_swiper_wrapper">
    <div className="slider_demo2">
      <div className="single_post post_type6" style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{
          width: '100%',
          aspectRatio: '16/9',
          background: 'linear-gradient(135deg, #354e84 0%, #2a4070 30%, #7ac142 70%, #354e84 100%)',
          backgroundSize: '400% 400%',
          animation: 'shimmerSlider 3s ease infinite',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem'
          }}>
            <i className="fa fa-paw" style={{ fontSize: '36px', color: 'rgba(255,255,255,0.6)' }}></i>
          </div>
          <div style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '1.3rem',
            fontWeight: '700',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '0.5rem'
          }}>
            AfricaVET
          </div>
          <div style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.85rem',
            fontWeight: '400'
          }}>
            Chargement des articles...
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '1.5rem' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.5)',
                animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite`
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
    <div className="slider_demo1">
      <div style={{ display: 'flex', gap: '10px', padding: '10px 0' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{
            flex: '0 0 12.5%',
            aspectRatio: '16/10',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #e2e8f0 0%, #f1f5f9 50%, #e2e8f0 100%)',
            backgroundSize: '200% 200%',
            animation: `shimmerSlider 2s ease ${i * 0.15}s infinite`
          }} />
        ))}
      </div>
    </div>
    <style>{`
      @keyframes shimmerSlider {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes dotPulse {
        0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
        40% { opacity: 1; transform: scale(1.2); }
      }
    `}</style>
  </div>
);

function ThumbsSwiper() {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [imagesReady, setImagesReady] = useState(false);
  const { galleryPosts, loading } = useData();
  const { getCategoryColor } = useApp();

  // Preload all slider images before showing
  useEffect(() => {
    if (galleryPosts.length === 0) {
      setImagesReady(false);
      return;
    }
    setImagesReady(false);
    const allImages = galleryPosts.slice(0, 9).map(p => p.image);
    preloadImages(allImages).then(() => setImagesReady(true));
  }, [galleryPosts]);

  // Show skeleton while data is loading OR images are not yet preloaded
  if (loading || galleryPosts.length === 0 || !imagesReady) {
    return <SliderSkeleton />;
  }

  const postSlider = galleryPosts;
  const thumbs = postSlider.map(p => p.image);

  return (
    <div className="thumbs_swiper_wrapper" style={{ animation: 'fadeInSlider 0.4s ease' }}>
      <div className="slider_demo2">
        <Slider
          loop={true}
          spaceBetween={10}
          thumbs={{
            swiper:
              thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
          }}
          slidesPerView={1}
          navigation={{
            nextEl: ".swiper-button-next-thumbs",
            prevEl: ".swiper-button-prev-thumbs",
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
        >
          {postSlider.slice(0, 9).map((item, i) => (
            <div key={item.id || i} className="single_post post_type6 xs-mb30">
              <div className="post_img gradient1" style={{ '--category-gradient-color': hexToRgba(getCategoryColor(item.categorySlug || 'news'), 0.9) }}>
                <img src={item.image} alt={item.title} />
                <Link to={`/categorie/${item.categorySlug || 'news'}`} className="category_badge" style={{ backgroundColor: getCategoryColor(item.categorySlug || 'news') }}>
                  {item.category}
                </Link>
                <span className="tranding">
                  <FontAwesome name="play" />
                </span>
              </div>
              <div className="single_post_text">
                <h4>
                  <Link className="play_btn" to={`/article/${item.slug}`}>
                    {item.title}
                  </Link>
                </h4>
                <p className="post-p">{item.body}</p>
                <span className="post_date">{item.date}</span>
              </div>
            </div>
          ))}
        </Slider>
      </div>
      <div className="slider_demo1">
        <div className="slider_arrow arrow_left slick-arrow swiper-button-prev-thumbs">
          <FontAwesome name="angle-left" />
        </div>
        <Slider
          onSwiper={setThumbsSwiper}
          loop={true}
          spaceBetween={10}
          slidesPerView={4}
          freeMode={true}
          watchSlidesProgress={true}
          breakpoints={{
            1024: {
              slidesPerView: 8,
            },
            768: {
              slidesPerView: 5,
            },
            320: {
              slidesPerView: 3,
            },
          }}
        >
          {thumbs.slice(0, 9).map((item, i) => (
            <div key={i} className="single_gallary_item">
              <img src={item} alt="thumb" />
            </div>
          ))}
        </Slider>
        <div className="slider_arrow arrow_right slick-arrow swiper-button-next-thumbs">
          <FontAwesome name="angle-right" />
        </div>
      </div>
      <style>{`
        @keyframes fadeInSlider {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default ThumbsSwiper;
