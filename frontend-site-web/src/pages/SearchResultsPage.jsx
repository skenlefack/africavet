import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import SEO from "../component/SEO";
import { getImageUrl as resolveImageUrl } from "../services/api";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [inputValue, setInputValue] = useState(query);
  const limit = 12;

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetch(`${API_URL}/posts?search=${encodeURIComponent(query)}&limit=${limit}&page=${page}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setResults(data.data || data.posts || []);
          setTotal(data.pagination?.total || data.total || data.data?.length || 0);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query, page]);

  useEffect(() => {
    setInputValue(query);
    setPage(1);
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() });
    }
  };

  const getImageUrl = (path) =>
    resolveImageUrl(path, null);

  const stripHtml = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "").substring(0, 180) + "...";
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <SEO title={query ? `Recherche : ${query}` : "Recherche"} />

      {/* Search Header */}
      <div style={{
        background: "linear-gradient(135deg, #354e84 0%, #2a4070 50%, #7ac142 100%)",
        padding: "3rem 0 2.5rem"
      }}>
        <div className="container">
          <h1 style={{ color: "#fff", fontWeight: 800, fontSize: "1.8rem", marginBottom: "0.5rem" }}>
            <i className="fa fa-search me-2"></i>
            {query ? `Résultats pour "${query}"` : "Rechercher sur AfricaVET"}
          </h1>
          {query && (
            <p style={{ color: "rgba(255,255,255,0.7)", margin: 0 }}>
              {loading ? "Recherche en cours..." : `${total} résultat${total !== 1 ? "s" : ""} trouvé${total !== 1 ? "s" : ""}`}
            </p>
          )}

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mt-3">
            <div className="input-group" style={{ maxWidth: "600px" }}>
              <input
                type="text"
                className="form-control form-control-lg"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Rechercher des articles, opportunités..."
                style={{ borderRadius: "12px 0 0 12px", border: "none", fontSize: "1rem" }}
                autoFocus
              />
              <button
                type="submit"
                className="btn btn-lg"
                style={{
                  background: "#7ac142",
                  color: "#fff",
                  borderRadius: "0 12px 12px 0",
                  fontWeight: 600,
                  padding: "0 1.5rem"
                }}
              >
                <i className="fa fa-search me-1"></i> Rechercher
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="container py-4">
        {/* Loading */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status" />
            <p className="text-muted mt-2">Recherche en cours...</p>
          </div>
        )}

        {/* No query */}
        {!query && !loading && (
          <div className="text-center py-5">
            <i className="fa fa-search fa-3x text-muted mb-3 d-block" style={{ opacity: 0.3 }}></i>
            <p className="text-muted">Saisissez un mot-clé pour lancer la recherche</p>
          </div>
        )}

        {/* No results */}
        {query && !loading && results.length === 0 && (
          <div className="text-center py-5">
            <i className="fa fa-frown-o fa-3x mb-3 d-block" style={{ color: "#cbd5e1" }}></i>
            <h4 style={{ color: "#64748b" }}>Aucun résultat pour "{query}"</h4>
            <p className="text-muted">Essayez avec d'autres mots-clés ou vérifiez l'orthographe</p>
          </div>
        )}

        {/* Results grid */}
        {!loading && results.length > 0 && (
          <>
            <div className="row g-4">
              {results.map((post) => {
                const imageUrl = getImageUrl(post.featured_image);
                return (
                  <div key={post.id} className="col-md-6 col-lg-4">
                    <Link
                      to={`/article/${post.slug}`}
                      className="text-decoration-none"
                    >
                      <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: "14px", overflow: "hidden", transition: "transform 0.2s" }}
                        onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
                        onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
                      >
                        {imageUrl ? (
                          <div style={{
                            height: "180px",
                            background: `url(${imageUrl}) center/cover`,
                            backgroundColor: "#f1f5f9"
                          }} />
                        ) : (
                          <div style={{
                            height: "180px",
                            background: "linear-gradient(135deg, #354e84 0%, #7ac142 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            <i className="fa fa-newspaper" style={{ fontSize: "2.5rem", color: "rgba(255,255,255,0.3)" }}></i>
                          </div>
                        )}
                        <div className="card-body">
                          <h6 style={{ color: "#1e293b", fontWeight: 700, lineHeight: 1.4, marginBottom: "0.5rem" }}>
                            {post.title_fr || post.title}
                          </h6>
                          <p style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.5, margin: 0 }}>
                            {stripHtml(post.excerpt_fr || post.excerpt || post.content_fr || post.content)}
                          </p>
                        </div>
                        <div className="card-footer bg-transparent border-0 pt-0" style={{ padding: "0 1rem 1rem" }}>
                          <small style={{ color: "#7ac142", fontWeight: 600 }}>
                            Lire l'article <i className="fa fa-arrow-right ms-1"></i>
                          </small>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center gap-2 mt-4">
                <button
                  className="btn btn-outline-secondary"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <i className="fa fa-chevron-left"></i>
                </button>
                <span className="btn btn-light disabled">
                  Page {page} / {totalPages}
                </span>
                <button
                  className="btn btn-outline-secondary"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  <i className="fa fa-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default SearchResultsPage;
