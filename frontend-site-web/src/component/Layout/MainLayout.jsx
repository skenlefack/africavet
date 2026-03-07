import React from "react";
import { Outlet, Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import ScrollTopButton from "../ScrollTopButton";
import SearchModal from "../SearchModal";

// AfricaVet Logo
import africavetLogo from "../../assets/img/africavet-logo.png";

const MainLayout = () => {
  const { categories, loading } = useApp();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const currentYear = new Date().getFullYear();

  // Main navigation categories
  const mainCategories = categories.filter(c => c.post_count > 0).slice(0, 8);

  return (
    <>
      {/* Top Bar */}
      <div className="topbar" style={{ background: '#354e84', color: 'white' }}>
        <div className="container py-2">
          <div className="row align-items-center">
            <div className="col-md-6">
              <small>
                <i className="far fa-clock me-1"></i>
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </small>
            </div>
            <div className="col-md-6 text-end">
              <div className="social-links">
                <a href="https://facebook.com/africavet" target="_blank" rel="noopener noreferrer" className="text-white me-3">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="https://twitter.com/africavet" target="_blank" rel="noopener noreferrer" className="text-white me-3">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="https://linkedin.com/company/africavet" target="_blank" rel="noopener noreferrer" className="text-white me-3">
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a href="https://youtube.com/africavet" target="_blank" rel="noopener noreferrer" className="text-white">
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="main-header sticky-top bg-white shadow-sm">
        <div className="container">
          <nav className="navbar navbar-expand-lg navbar-light py-2">
            {/* Logo */}
            <Link to="/" className="navbar-brand d-flex align-items-center">
              <img src={africavetLogo} alt="AfricaVet" style={{ height: '55px', maxWidth: '180px' }} />
            </Link>

            {/* Mobile Toggle */}
            <button
              className="navbar-toggler"
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            {/* Navigation */}
            <div className={`collapse navbar-collapse ${isMobileMenuOpen ? 'show' : ''}`}>
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <Link to="/" className="nav-link fw-semibold">Accueil</Link>
                </li>

                {/* Categories Dropdown */}
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle fw-semibold"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                  >
                    Rubriques
                  </a>
                  <ul className="dropdown-menu">
                    {mainCategories.map(cat => (
                      <li key={cat.id}>
                        <Link to={`/categorie/${cat.slug}`} className="dropdown-item">
                          {cat.icon && <i className={`fas ${cat.icon} me-2 text-success`}></i>}
                          {cat.name_fr || cat.name}
                        </Link>
                      </li>
                    ))}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <Link to="/categories" className="dropdown-item">
                        <i className="fas fa-th-large me-2"></i>Toutes les catégories
                      </Link>
                    </li>
                  </ul>
                </li>

                <li className="nav-item">
                  <Link to="/categorie/opportunites" className="nav-link fw-semibold">Opportunités</Link>
                </li>

                <li className="nav-item">
                  <Link to="/categorie/publications" className="nav-link fw-semibold">Publications</Link>
                </li>

                <li className="nav-item">
                  <Link to="/about" className="nav-link fw-semibold">À propos</Link>
                </li>

                <li className="nav-item">
                  <Link to="/contact" className="nav-link fw-semibold">Contact</Link>
                </li>
              </ul>

              {/* Search Button */}
              <div className="d-flex align-items-center gap-3">
                <button
                  className="btn btn-outline-success"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Footer Modern */}
      <footer className="footer-modern">
        {/* Footer Main */}
        <div className="footer-main">
          <div className="container">
            <div className="footer-grid">
              {/* Brand Section */}
              <div className="footer-brand">
                <Link to="/" className="footer-logo">
                  <img src={africavetLogo} alt="AfricaVet" />
                </Link>
                <p className="footer-tagline">
                  Le portail de référence de la médecine vétérinaire en Afrique
                </p>
                <div className="footer-social">
                  <a href="https://facebook.com/africavet" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="https://twitter.com/africavet" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="https://linkedin.com/company/africavet" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                  <a href="https://youtube.com/africavet" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                    <i className="fab fa-youtube"></i>
                  </a>
                </div>
              </div>

              {/* Services */}
              <div className="footer-links">
                <h4>Nos Services</h4>
                <ul>
                  <li><Link to="/categorie/news"><i className="fa fa-newspaper-o"></i> S'informer</Link></li>
                  <li><Link to="/categorie/one-health"><i className="fa fa-globe"></i> One Health</Link></li>
                  <li><Link to="/categorie/formations"><i className="fa fa-graduation-cap"></i> Se Former</Link></li>
                  <li><Link to="/categorie/opportunites"><i className="fa fa-briefcase"></i> Opportunités</Link></li>
                  <li><Link to="/annuaire"><i className="fa fa-address-book"></i> Annuaire Vétérinaire</Link></li>
                </ul>
              </div>

              {/* Navigation */}
              <div className="footer-links">
                <h4>Navigation</h4>
                <ul>
                  <li><Link to="/"><i className="fa fa-home"></i> Accueil</Link></li>
                  <li><Link to="/about"><i className="fa fa-info-circle"></i> À propos</Link></li>
                  <li><Link to="/contact"><i className="fa fa-envelope"></i> Contact</Link></li>
                  <li><Link to="/publicite"><i className="fa fa-bullhorn"></i> Publicité</Link></li>
                </ul>
              </div>

              {/* Contact */}
              <div className="footer-contact">
                <h4>Contact</h4>
                <div className="contact-item">
                  <i className="fa fa-envelope"></i>
                  <span>contact@africavet.com</span>
                </div>
                <div className="contact-item">
                  <i className="fa fa-globe"></i>
                  <span>www.africavet.com</span>
                </div>
                <Link to="/inscription" className="footer-cta">
                  <i className="fa fa-user-plus"></i>
                  Rejoindre la communauté
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="container">
            <div className="footer-bottom-content">
              <p>© {currentYear} AfricaVet. Tous droits réservés.</p>
              <div className="footer-legal">
                <Link to="/mentions-legales">Mentions légales</Link>
                <span>•</span>
                <Link to="/confidentialite">Confidentialité</Link>
                <span>•</span>
                <Link to="/conditions">CGU</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <ScrollTopButton />

      {/* Search Modal */}
      {isSearchOpen && (
        <SearchModal onClose={() => setIsSearchOpen(false)} />
      )}
    </>
  );
};

export default MainLayout;
