import React from "react";
import BreadCrumb from "../../component/BreadCrumb";
import { Link } from "react-router-dom";
import "./legal.scss";

const MentionsLegalesPage = () => {
  return (
    <>
      <BreadCrumb className="shadow5" title="Mentions Légales" />
      <div className="legal-page section-padding">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="legal-content">
                <h1>Mentions Légales</h1>
                <p className="legal-updated">Dernière mise à jour : 29 mars 2026</p>

                <h2>1. Éditeur du site</h2>
                <p>
                  Le site <strong>www.africavet.com</strong> (ci-après « AfricaVET ») est une plateforme numérique
                  panafricaine dédiée aux professionnels de la santé animale.
                </p>
                <ul>
                  <li><strong>Dénomination</strong> : AfricaVET</li>
                  <li><strong>Activité</strong> : Plateforme d'information, de formation et de mise en réseau
                    des professionnels vétérinaires en Afrique</li>
                  <li><strong>E-mail</strong> : contact@africavet.com</li>
                  <li><strong>Site web</strong> : www.africavet.com</li>
                </ul>

                <h2>2. Directeur de la publication</h2>
                <p>
                  Le directeur de la publication est le représentant légal de la structure exploitant AfricaVET.
                </p>

                <h2>3. Hébergement</h2>
                <p>Le site AfricaVET est hébergé par :</p>
                <ul>
                  <li><strong>Hébergeur</strong> : OVH SAS</li>
                  <li><strong>Adresse</strong> : 2 rue Kellermann, 59100 Roubaix, France</li>
                  <li><strong>Site web</strong> : www.ovhcloud.com</li>
                </ul>

                <h2>4. Description des services</h2>
                <p>
                  AfricaVET est une plateforme qui offre les services suivants aux professionnels de la santé
                  animale en Afrique :
                </p>
                <ul>
                  <li><strong>Articles d'actualité</strong> : informations et nouvelles du secteur vétérinaire africain</li>
                  <li><strong>E-learning</strong> : cours et formations en ligne avec délivrance de certificats</li>
                  <li><strong>Annuaire panafricain</strong> : répertoire des professionnels vétérinaires, experts,
                    organisations et fournisseurs en Afrique</li>
                  <li><strong>Bibliothèque documentaire</strong> : publications scientifiques, guides techniques et
                    ressources documentaires</li>
                  <li><strong>Alertes vétérinaires</strong> : système de signalement et de suivi des alertes
                    sanitaires animales</li>
                  <li><strong>Opportunités professionnelles</strong> : offres d'emploi, stages, bourses et appels
                    à projets dans le secteur vétérinaire</li>
                  <li><strong>Newsletter</strong> : lettre d'information périodique sur l'actualité vétérinaire</li>
                </ul>

                <h2>5. Propriété intellectuelle</h2>
                <p>
                  L'ensemble du contenu du site AfricaVET (textes, images, graphismes, logos, vidéos, icônes,
                  sons, logiciels, bases de données, cours de formation) est protégé par les lois relatives à
                  la propriété intellectuelle.
                </p>
                <p>
                  Le logo, le nom « AfricaVET » et l'identité visuelle de la plateforme sont la propriété
                  exclusive d'AfricaVET. Toute reproduction, représentation ou utilisation non autorisée de ces
                  éléments est strictement interdite.
                </p>
                <p>
                  Les contenus éditoriaux, articles et publications scientifiques sont soit la propriété
                  d'AfricaVET, soit publiés avec l'autorisation de leurs auteurs respectifs. Toute reproduction
                  doit faire l'objet d'une autorisation préalable écrite.
                </p>

                <h2>6. Données personnelles</h2>
                <p>
                  AfricaVET collecte et traite des données personnelles dans le cadre de l'utilisation de la
                  Plateforme. Pour plus d'informations sur la collecte, l'utilisation et la protection de vos
                  données personnelles, veuillez consulter notre{" "}
                  <Link to="/confidentialite">Politique de Confidentialité</Link>.
                </p>

                <h2>7. Cookies</h2>
                <p>
                  Le site AfricaVET utilise des cookies pour assurer le bon fonctionnement de la plateforme
                  et améliorer l'expérience utilisateur. Les cookies utilisés sont principalement des cookies
                  techniques (authentification, session) et des cookies de mesure d'audience.
                </p>
                <p>
                  Vous pouvez paramétrer votre navigateur pour accepter ou refuser les cookies. Le refus de
                  certains cookies peut limiter l'accès à certaines fonctionnalités de la Plateforme.
                </p>

                <h2>8. Limitation de responsabilité</h2>
                <p>
                  AfricaVET s'efforce de fournir des informations exactes et à jour. Toutefois, les informations
                  publiées sur la Plateforme sont fournies à titre informatif et éducatif uniquement. Elles
                  ne sauraient en aucun cas se substituer à un avis vétérinaire professionnel.
                </p>
                <p>
                  AfricaVET ne saurait être tenue responsable :
                </p>
                <ul>
                  <li>Des erreurs ou omissions dans les contenus publiés</li>
                  <li>Des dommages directs ou indirects résultant de l'utilisation des informations de la Plateforme</li>
                  <li>Des interruptions temporaires de service pour maintenance ou raisons techniques</li>
                  <li>Du contenu des sites tiers accessibles via des liens hypertextes</li>
                  <li>De l'exactitude des informations fournies par les professionnels dans l'annuaire</li>
                </ul>

                <h2>9. Liens hypertextes</h2>
                <p>
                  La Plateforme peut contenir des liens vers des sites web tiers (organisations vétérinaires
                  internationales, universités, partenaires). AfricaVET n'exerce aucun contrôle sur ces sites
                  et décline toute responsabilité quant à leur contenu.
                </p>
                <p>
                  La création de liens vers le site AfricaVET est autorisée sous réserve de ne pas utiliser
                  la technique du « deep linking » ou du « framing », et que les liens ne portent pas atteinte
                  à l'image d'AfricaVET.
                </p>

                <h2>10. Droit applicable</h2>
                <p>
                  Les présentes mentions légales sont régies par le droit applicable dans le pays du siège
                  social d'AfricaVET. Tout litige relatif à l'utilisation du site sera soumis à la compétence
                  des tribunaux compétents.
                </p>

                <h2>11. Contact</h2>
                <p>
                  Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter :
                </p>
                <ul>
                  <li>Par e-mail : <strong>contact@africavet.com</strong></li>
                  <li>Via notre <Link to="/contact">page de contact</Link></li>
                </ul>

                <h2>12. Autres documents juridiques</h2>
                <ul>
                  <li><Link to="/conditions">Conditions Générales d'Utilisation (CGU)</Link></li>
                  <li><Link to="/confidentialite">Politique de Confidentialité</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="space-70" />
    </>
  );
};

export default MentionsLegalesPage;
