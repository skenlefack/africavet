import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LoadingSpinner from "../component/shared/LoadingSpinner";

const API_URL = import.meta.env.VITE_API_URL || "/api";

/**
 * Handles old WordPress-style URLs (/:slug) by checking if the slug
 * matches an existing article, then redirecting to /article/:slug.
 * Falls back to the 404 page if no match is found.
 */
const SlugRedirect = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      return;
    }

    const cleanSlug = slug.replace(/\/$/, "");

    fetch(`${API_URL}/posts/${encodeURIComponent(cleanSlug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          navigate(`/article/${cleanSlug}`, { replace: true });
        } else {
          setNotFound(true);
        }
      })
      .catch(() => {
        setNotFound(true);
      });
  }, [slug, navigate]);

  if (notFound) {
    navigate("/404", { replace: true });
    return null;
  }

  return (
    <div className="text-center py-5">
      <LoadingSpinner />
      <p className="text-muted mt-3">Redirection en cours...</p>
    </div>
  );
};

export default SlugRedirect;
