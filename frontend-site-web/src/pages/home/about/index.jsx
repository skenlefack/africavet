import React from "react";
import { Link } from "react-router-dom";
import FontAwesome from "../../../component/uiStyle/FontAwesome";
import NewsLetter from "../../../component/NewsLetter";
import "./about.scss";

const pillars = [
  {
    icon: "newspaper-o",
    title: "S'informer",
    description: "Actualités, analyses et ressources techniques sur la santé animale en Afrique, mises à jour quotidiennement.",
    color: "#1091FF",
  },
  {
    icon: "globe",
    title: "One Health",
    description: "Promouvoir l'approche Une Seule Santé liant santé humaine, animale et environnementale sur le continent.",
    color: "#00AB6C",
  },
  {
    icon: "graduation-cap",
    title: "Se Former",
    description: "Formations en ligne, certifications et parcours d'apprentissage pour les professionnels vétérinaires africains.",
    color: "#FF6B35",
  },
  {
    icon: "handshake-o",
    title: "S'engager",
    description: "Opportunités d'emploi, appels d'offres, bourses et marchés pour développer votre carrière vétérinaire.",
    color: "#9B59B6",
  },
  {
    icon: "shield",
    title: "Agir",
    description: "Alertes sanitaires, surveillance épidémiologique et outils de veille pour protéger le cheptel africain.",
    color: "#E74C3C",
  },
];

const services = [
  {
    icon: "rss",
    title: "Actualités & Analyses",
    description: "Couverture éditoriale quotidienne des enjeux vétérinaires et de santé animale à travers tout le continent africain.",
  },
  {
    icon: "exclamation-triangle",
    title: "Alertes Vétérinaires",
    description: "Système de veille sanitaire pour signaler et suivre les foyers de maladies animales en temps réel.",
  },
  {
    icon: "book",
    title: "E-Learning & Certifications",
    description: "Plateforme de formation continue avec cours, quiz et certificats pour les professionnels vétérinaires.",
  },
  {
    icon: "briefcase",
    title: "Opportunités Professionnelles",
    description: "Offres d'emploi, appels d'offres, bourses et marchés publics dans le secteur vétérinaire et agropastoral.",
  },
  {
    icon: "address-book",
    title: "Annuaire Panafricain",
    description: "Répertoire des professionnels, organisations et institutions vétérinaires à travers l'Afrique.",
  },
  {
    icon: "file-text-o",
    title: "Bibliothèque Documentaire",
    description: "Publications scientifiques, rapports, fiches techniques et outils pour les praticiens de terrain.",
  },
];

function About() {
  return (
    <div className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="container">
          <div className="hero-content">
            <h1>
              <span>Africa</span>VET
            </h1>
            <p className="hero-subtitle">
              Plateforme panafricaine d&eacute;di&eacute;e &agrave; la m&eacute;decine v&eacute;t&eacute;rinaire et &agrave; la sant&eacute; animale en Afrique.
              Nous offrons des actualit&eacute;s, analyses et ressources techniques dans une approche One Health,
              ainsi que des outils pratiques et des opportunit&eacute;s professionnelles pour la communaut&eacute;
              v&eacute;t&eacute;rinaire et les acteurs de l'&eacute;levage.
            </p>
          </div>
        </div>
      </section>

      {/* Mission / Vision / Valeurs */}
      <section className="about-mission">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 mb-4">
              <div className="mission-card mission">
                <div className="mission-icon bg-blue">
                  <FontAwesome name="bullseye" />
                </div>
                <h3>Notre Mission</h3>
                <p>
                  Fournir aux professionnels v&eacute;t&eacute;rinaires africains une plateforme d'information,
                  de formation et de mise en r&eacute;seau de r&eacute;f&eacute;rence, contribuant &agrave; l'am&eacute;lioration
                  de la sant&eacute; animale et de la s&eacute;curit&eacute; alimentaire sur le continent.
                </p>
              </div>
            </div>
            <div className="col-lg-4 mb-4">
              <div className="mission-card vision">
                <div className="mission-icon bg-green">
                  <FontAwesome name="eye" />
                </div>
                <h3>Notre Vision</h3>
                <p>
                  Une Afrique o&ugrave; la sant&eacute; animale est au c&oelig;ur des politiques de d&eacute;veloppement,
                  soutenue par une communaut&eacute; v&eacute;t&eacute;rinaire connect&eacute;e, form&eacute;e et engag&eacute;e
                  dans l'approche Une Seule Sant&eacute; pour prot&eacute;ger les populations, les animaux et l'environnement.
                </p>
              </div>
            </div>
            <div className="col-lg-4 mb-4">
              <div className="mission-card values">
                <div className="mission-icon bg-orange">
                  <FontAwesome name="heart" />
                </div>
                <h3>Nos Valeurs</h3>
                <p>
                  Rigueur scientifique, engagement panafricain, accessibilit&eacute; de l'information,
                  collaboration interdisciplinaire et service &agrave; la communaut&eacute; v&eacute;t&eacute;rinaire.
                  Nous croyons en un continent r&eacute;silient par la force de ses professionnels.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Les 5 Piliers */}
      <section className="about-pillars">
        <div className="container">
          <div className="section-title">
            <h2>Les 5 Piliers AfricaVET</h2>
            <p>Notre action s'articule autour de cinq axes strat&eacute;giques</p>
          </div>
          <div className="row">
            {pillars.map((pillar, i) => (
              <div key={i} className="col-lg col-md-4 col-6 mb-4">
                <div className="pillar-card">
                  <div className="pillar-icon" style={{ background: pillar.color }}>
                    <FontAwesome name={pillar.icon} />
                  </div>
                  <h4>{pillar.title}</h4>
                  <p>{pillar.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ce que nous faisons */}
      <section className="about-services">
        <div className="container">
          <div className="row">
            <div className="col-lg-5 mb-4">
              <h2 style={{ fontWeight: 700, color: '#222', marginBottom: 15 }}>
                Ce que nous faisons
              </h2>
              <p style={{ color: '#666', lineHeight: 1.8, marginBottom: 25 }}>
                AfricaVET rassemble en un seul portail l'ensemble des ressources dont les professionnels
                v&eacute;t&eacute;rinaires africains ont besoin au quotidien : de l'information &agrave;
                la formation, de l'alerte sanitaire &agrave; l'opportunit&eacute; de carri&egrave;re.
              </p>
              <NewsLetter />
            </div>
            <div className="col-lg-7">
              <div className="row">
                {services.map((service, i) => (
                  <div key={i} className="col-md-6">
                    <div className="service-item">
                      <div className="service-icon">
                        <FontAwesome name={service.icon} />
                      </div>
                      <div className="service-text">
                        <h5>{service.title}</h5>
                        <p>{service.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="about-stats">
        <div className="container">
          <div className="row">
            <div className="col-6 col-md-3">
              <div className="stat-item">
                <span className="stat-number">54</span>
                <span className="stat-label">Pays couverts</span>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="stat-item">
                <span className="stat-number">1 200+</span>
                <span className="stat-label">Articles publi&eacute;s</span>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="stat-item">
                <span className="stat-number">400+</span>
                <span className="stat-label">Opportunit&eacute;s</span>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="stat-item">
                <span className="stat-number">5 000+</span>
                <span className="stat-label">Professionnels</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Réseaux */}
      <section className="about-contact">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 mb-4">
              <div className="contact-card">
                <div className="contact-icon">
                  <FontAwesome name="pencil" />
                </div>
                <h5>R&eacute;daction & Partenariats</h5>
                <p>Proposez vos articles, analyses ou collaborations &eacute;ditoriales.</p>
                <a href="mailto:redaction@africavet.com">redaction@africavet.com</a>
              </div>
            </div>
            <div className="col-lg-4 mb-4">
              <div className="contact-card">
                <div className="contact-icon">
                  <FontAwesome name="envelope" />
                </div>
                <h5>Contact G&eacute;n&eacute;ral</h5>
                <p>Corrections, signalements, questions ou suggestions.</p>
                <a href="mailto:contact@africavet.com">contact@africavet.com</a>
              </div>
            </div>
            <div className="col-lg-4 mb-4">
              <div className="contact-card">
                <div className="contact-icon">
                  <FontAwesome name="share-alt" />
                </div>
                <h5>Suivez-nous</h5>
                <p>Rejoignez notre communaut&eacute; sur les r&eacute;seaux sociaux.</p>
                <div className="social-links">
                  <a href="https://www.facebook.com/africavetwebportail" target="_blank" rel="noopener noreferrer" className="fb">
                    <FontAwesome name="facebook" />
                  </a>
                  <a href="https://x.com/africavet" target="_blank" rel="noopener noreferrer" className="tw">
                    <FontAwesome name="twitter" />
                  </a>
                  <a href="https://be.linkedin.com/in/africavet-v%C3%A9t%C3%A9rinaire-4b43a920" target="_blank" rel="noopener noreferrer" className="li">
                    <FontAwesome name="linkedin" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="about-disclaimer">
        <div className="container">
          <div className="disclaimer-box">
            <p>
              <strong>Avertissement :</strong> AfricaVET est une plateforme d'information.
              En cas d'urgence sanitaire ou de situation clinique, contactez un v&eacute;t&eacute;rinaire
              et/ou les services v&eacute;t&eacute;rinaires comp&eacute;tents de votre pays.
              Les informations soumises via nos formulaires sont utilis&eacute;es uniquement pour traiter
              votre demande et ne seront pas partag&eacute;es, sauf n&eacute;cessit&eacute; &eacute;ditoriale
              ou obligation l&eacute;gale.
            </p>
          </div>
        </div>
      </section>

      <div className="space-30" />
    </div>
  );
}

export default About;
