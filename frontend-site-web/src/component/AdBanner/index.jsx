import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Generate unique visitor ID
const getVisitorId = () => {
  let visitorId = localStorage.getItem("av_visitor_id");
  if (!visitorId) {
    visitorId = "v_" + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    localStorage.setItem("av_visitor_id", visitorId);
  }
  return visitorId;
};

// Detect device type
const getDeviceType = () => {
  const ua = navigator.userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
  return "desktop";
};

const AdBanner = ({
  placement,
  fallbackImage,
  fallbackUrl,
  fallbackAlt,
  className,
  style,
  rotationInterval = 10000, // Rotation every 10 seconds
}) => {
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [placementInfo, setPlacementInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [impressionTracked, setImpressionTracked] = useState({});
  const containerRef = useRef(null);
  const rotationTimerRef = useRef(null);

  // Fetch ads for this placement
  const fetchAds = useCallback(async () => {
    try {
      const device = getDeviceType();
      const response = await fetch(`${API_BASE_URL}/ads/serve/${placement}?device=${device}`);
      const data = await response.json();

      if (data.success && data.data && data.data.length > 0) {
        setAds(data.data);
        setPlacementInfo(data.placement);
        setError(false);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("AdBanner: Failed to fetch ads", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [placement]);

  // Track impression
  const trackImpression = useCallback(async (adId) => {
    if (impressionTracked[adId]) return;

    try {
      await fetch(`${API_BASE_URL}/ads/track/impression`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ad_id: adId,
          visitor_id: getVisitorId(),
          page_url: window.location.href,
        }),
      });
      setImpressionTracked((prev) => ({ ...prev, [adId]: true }));
    } catch (err) {
      console.error("AdBanner: Failed to track impression", err);
    }
  }, [impressionTracked]);

  // Track click
  const trackClick = useCallback(async (ad) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ads/track/click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ad_id: ad.id,
          visitor_id: getVisitorId(),
          page_url: window.location.href,
        }),
      });
      const data = await response.json();

      // Redirect to target URL
      if (ad.target_url) {
        if (ad.target_url.startsWith('/')) {
          window.location.href = ad.target_url;
        } else {
          window.open(ad.target_url, "_blank", "noopener,noreferrer");
        }
      }
    } catch (err) {
      console.error("AdBanner: Failed to track click", err);
      // Still redirect even if tracking fails
      if (ad.target_url) {
        if (ad.target_url.startsWith('/')) {
          window.location.href = ad.target_url;
        } else {
          window.open(ad.target_url, "_blank", "noopener,noreferrer");
        }
      }
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  // Track impression when ad becomes visible
  useEffect(() => {
    if (ads.length > 0 && ads[currentAdIndex]) {
      trackImpression(ads[currentAdIndex].id);
    }
  }, [ads, currentAdIndex, trackImpression]);

  // Rotation timer
  useEffect(() => {
    if (ads.length > 1) {
      rotationTimerRef.current = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, rotationInterval);
    }

    return () => {
      if (rotationTimerRef.current) {
        clearInterval(rotationTimerRef.current);
      }
    };
  }, [ads.length, rotationInterval]);

  // Render AdSense
  const renderAdSense = (ad) => {
    useEffect(() => {
      // Load AdSense script if not already loaded
      if (!window.adsbygoogle) {
        const script = document.createElement("script");
        script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
        script.async = true;
        script.crossOrigin = "anonymous";
        document.head.appendChild(script);
      }

      // Initialize ad
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }, []);

    return (
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          width: ad.width || placementInfo?.width || "100%",
          height: ad.height || placementInfo?.height || "auto",
        }}
        data-ad-client={ad.adsense_client}
        data-ad-slot={ad.adsense_slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    );
  };

  // Render HTML/Script ad
  const renderHtmlAd = (ad) => {
    const containerRef = useRef(null);

    useEffect(() => {
      if (containerRef.current && ad.ad_code) {
        // Create a div for the ad code
        containerRef.current.innerHTML = ad.ad_code;

        // Execute any scripts
        const scripts = containerRef.current.querySelectorAll("script");
        scripts.forEach((script) => {
          const newScript = document.createElement("script");
          Array.from(script.attributes).forEach((attr) => {
            newScript.setAttribute(attr.name, attr.value);
          });
          newScript.textContent = script.textContent;
          script.parentNode.replaceChild(newScript, script);
        });
      }
    }, [ad.ad_code]);

    return <div ref={containerRef} />;
  };

  // Render image ad
  const renderImageAd = (ad) => {
    const device = getDeviceType();
    const imageUrl = device === "mobile" && ad.image_url_mobile ? ad.image_url_mobile : ad.image_url;

    return (
      <div
        className="ad-banner-image-wrapper"
        onClick={() => trackClick(ad)}
        style={{ cursor: ad.target_url ? "pointer" : "default", width: "100%", height: "100%" }}
      >
        <img
          src={imageUrl}
          alt={ad.alt_text || "Publicite"}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    );
  };

  // Render current ad
  const renderAd = () => {
    const ad = ads[currentAdIndex];
    if (!ad) return null;

    switch (ad.type) {
      case "adsense":
        return renderAdSense(ad);
      case "html":
      case "script":
        return renderHtmlAd(ad);
      case "image":
      default:
        return renderImageAd(ad);
    }
  };

  // Render fallback
  const renderFallback = () => {
    if (fallbackImage) {
      return (
        <a
          href={fallbackUrl || "#"}
          target={fallbackUrl ? "_blank" : "_self"}
          rel="noopener noreferrer"
          style={{ display: "block" }}
        >
          <img
            src={fallbackImage}
            alt={fallbackAlt || "banner"}
            style={{
              width: "100%",
              height: "auto",
            }}
          />
        </a>
      );
    }
    return null;
  };

  // Container styles
  const containerStyle = {
    position: "relative",
    width: placementInfo?.width ? `${placementInfo.width}px` : "100%",
    maxWidth: "100%",
    ...style,
  };

  if (loading) {
    return (
      <div
        ref={containerRef}
        className={`ad-banner ad-banner-loading ${className || ""}`}
        style={containerStyle}
      >
        {fallbackImage ? renderFallback() : (
          <div
            style={{
              background: "#f5f5f5",
              height: placementInfo?.height || 90,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "#999", fontSize: "0.8rem" }}>Chargement...</span>
          </div>
        )}
      </div>
    );
  }

  if (error || ads.length === 0) {
    return (
      <div
        ref={containerRef}
        className={`ad-banner ad-banner-fallback ${className || ""}`}
        style={containerStyle}
      >
        {renderFallback()}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`ad-banner ${className || ""}`}
      style={containerStyle}
    >
      {/* Ad Content */}
      <div className="ad-banner-content" style={{ width: "100%", height: "100%" }}>
        {renderAd()}
      </div>

      {/* Rotation Indicator (if multiple ads) */}
      {ads.length > 1 && (
        <div
          className="ad-banner-indicators"
          style={{
            position: "absolute",
            bottom: 4,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 4,
          }}
        >
          {ads.map((_, index) => (
            <span
              key={index}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: index === currentAdIndex ? "#7ac142" : "rgba(0,0,0,0.3)",
                cursor: "pointer",
              }}
              onClick={() => setCurrentAdIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

AdBanner.propTypes = {
  placement: PropTypes.string.isRequired,
  fallbackImage: PropTypes.string,
  fallbackUrl: PropTypes.string,
  fallbackAlt: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  rotationInterval: PropTypes.number,
};

export default AdBanner;
