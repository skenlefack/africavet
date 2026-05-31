import React from "react";
import BreadCrumb from "../../component/BreadCrumb";
import { Link } from "react-router-dom";
import "./legal.scss";

const ConditionsPage = () => {
  return (
    <>
      <BreadCrumb className="shadow5" title="Conditions Générales d'Utilisation" />
      <div className="legal-page section-padding">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="legal-content">
                <h1>Conditions Générales d'Utilisation (CGU)</h1>
                <p className="legal-updated">Dernière mise à jour : 29 mars 2026</p>

                <h2>1. Objet</h2>
                <p>
                  Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») ont pour objet de définir
                  les modalités et conditions d'accès et d'utilisation de la plateforme AfricaVet, accessible à
                  l'adresse <strong>www.africavet.com</strong> (ci-après « la Plateforme »).
                </p>
                <p>
                  AfricaVet est une plateforme numérique panafricaine dédiée aux professionnels de la santé
                  animale, proposant des services d'information, de formation en ligne (e-learning), d'annuaire
                  professionnel, de bibliothèque documentaire, d'alertes vétérinaires et d'opportunités
                  professionnelles.
                </p>
                <p>
                  L'accès et l'utilisation de la Plateforme impliquent l'acceptation pleine et entière des
                  présentes CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser la Plateforme.
                </p>

                <h2>2. Définitions</h2>
                <ul>
                  <li><strong>Utilisateur</strong> : toute personne physique ou morale accédant à la Plateforme.</li>
                  <li><strong>Membre</strong> : Utilisateur ayant créé un compte sur la Plateforme.</li>
                  <li><strong>Contenu</strong> : ensemble des informations, articles, documents, cours, vidéos et
                    données disponibles sur la Plateforme.</li>
                  <li><strong>Services</strong> : ensemble des fonctionnalités offertes par la Plateforme, incluant
                    mais sans s'y limiter : articles d'actualité, e-learning, annuaire vétérinaire panafricain,
                    bibliothèque documentaire, alertes vétérinaires et opportunités professionnelles.</li>
                </ul>

                <h2>3. Accès à la Plateforme</h2>
                <h3>3.1 Accès libre</h3>
                <p>
                  Certains contenus de la Plateforme sont accessibles librement et sans inscription, notamment
                  les articles d'actualité, les alertes vétérinaires publiques et les pages d'information générale.
                </p>
                <h3>3.2 Accès réservé aux Membres</h3>
                <p>
                  L'accès aux services suivants nécessite la création d'un compte Membre :
                </p>
                <ul>
                  <li>Plateforme de formation en ligne (e-learning)</li>
                  <li>Annuaire vétérinaire panafricain</li>
                  <li>Bibliothèque documentaire</li>
                  <li>Opportunités professionnelles</li>
                  <li>Soumission d'alertes vétérinaires</li>
                  <li>Tableau de bord personnel et notifications</li>
                </ul>

                <h2>4. Création de compte</h2>
                <p>
                  Pour créer un compte, l'Utilisateur doit fournir des informations exactes, complètes et à jour,
                  notamment : nom, prénom, adresse e-mail, pays et mot de passe. L'Utilisateur s'engage à
                  maintenir la confidentialité de ses identifiants de connexion et est seul responsable de toute
                  activité réalisée sous son compte.
                </p>
                <p>
                  AfricaVet se réserve le droit de suspendre ou supprimer tout compte en cas de violation des
                  présentes CGU ou d'utilisation frauduleuse de la Plateforme.
                </p>

                <h2>5. Utilisation de la Plateforme</h2>
                <h3>5.1 Usages autorisés</h3>
                <p>La Plateforme est destinée à un usage professionnel et éducatif dans le domaine de la santé animale. Les Membres s'engagent à :</p>
                <ul>
                  <li>Utiliser la Plateforme conformément à sa finalité</li>
                  <li>Respecter les droits de propriété intellectuelle des contenus</li>
                  <li>Fournir des informations exactes lors de l'inscription et des contributions</li>
                  <li>Respecter les autres utilisateurs et les règles de courtoisie</li>
                </ul>
                <h3>5.2 Usages interdits</h3>
                <p>Il est strictement interdit de :</p>
                <ul>
                  <li>Reproduire, copier ou distribuer le Contenu de la Plateforme sans autorisation préalable</li>
                  <li>Utiliser la Plateforme à des fins commerciales non autorisées</li>
                  <li>Collecter les données personnelles d'autres utilisateurs</li>
                  <li>Diffuser des contenus illicites, diffamatoires, discriminatoires ou contraires à l'ordre public</li>
                  <li>Tenter d'accéder de manière non autorisée aux systèmes informatiques de la Plateforme</li>
                  <li>Utiliser des robots, scrapers ou tout autre moyen automatisé pour accéder à la Plateforme</li>
                </ul>

                <h2>6. Propriété intellectuelle</h2>
                <p>
                  L'ensemble des éléments de la Plateforme (textes, images, vidéos, graphismes, logo, icônes,
                  logiciels, bases de données, cours de formation) sont protégés par le droit de la propriété
                  intellectuelle et sont la propriété exclusive d'AfricaVet ou de ses partenaires.
                </p>
                <p>
                  Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie
                  des éléments de la Plateforme, quel que soit le moyen ou le procédé utilisé, est interdite
                  sans l'autorisation écrite préalable d'AfricaVet.
                </p>

                <h2>7. Formation en ligne (E-learning)</h2>
                <p>
                  Les cours et modules de formation disponibles sur la Plateforme sont réservés à un usage
                  personnel et non transférable. Les certificats délivrés à l'issue des formations attestent de la
                  participation du Membre et ne sauraient se substituer à des diplômes officiels.
                </p>
                <p>
                  AfricaVet s'efforce de garantir la qualité et l'exactitude des contenus pédagogiques, mais ne
                  saurait être tenue responsable des décisions prises sur la base de ces formations.
                </p>

                <h2>8. Annuaire vétérinaire</h2>
                <p>
                  L'annuaire panafricain recense des professionnels, experts, organisations et fournisseurs du
                  secteur vétérinaire en Afrique. Les informations publiées sont fournies par les professionnels
                  eux-mêmes ou collectées auprès de sources publiques. AfricaVet ne garantit pas l'exactitude
                  ou l'exhaustivité de ces informations.
                </p>

                <h2>9. Responsabilité</h2>
                <h3>9.1 Responsabilité d'AfricaVet</h3>
                <p>
                  AfricaVet s'efforce d'assurer l'accessibilité et le bon fonctionnement de la Plateforme
                  24h/24, 7j/7. Toutefois, AfricaVet ne saurait être tenue responsable des interruptions de
                  service, qu'elles soient dues à des opérations de maintenance, des pannes techniques ou des
                  cas de force majeure.
                </p>
                <p>
                  Les informations et contenus publiés sur la Plateforme sont fournis à titre informatif et
                  éducatif. Ils ne constituent en aucun cas un avis vétérinaire professionnel. AfricaVet décline
                  toute responsabilité en cas de dommages directs ou indirects résultant de l'utilisation des
                  informations disponibles sur la Plateforme.
                </p>
                <h3>9.2 Responsabilité de l'Utilisateur</h3>
                <p>
                  L'Utilisateur est seul responsable de l'utilisation qu'il fait de la Plateforme et des contenus
                  qu'il publie. Il garantit AfricaVet contre toute réclamation de tiers liée à son utilisation
                  de la Plateforme.
                </p>

                <h2>10. Liens hypertextes</h2>
                <p>
                  La Plateforme peut contenir des liens vers des sites tiers. AfricaVet n'exerce aucun contrôle
                  sur ces sites et décline toute responsabilité quant à leur contenu ou leurs pratiques en matière
                  de protection des données personnelles.
                </p>

                <h2>11. Modification des CGU</h2>
                <p>
                  AfricaVet se réserve le droit de modifier les présentes CGU à tout moment. Les modifications
                  prennent effet dès leur publication sur la Plateforme. L'Utilisateur sera informé des
                  modifications substantielles par e-mail ou notification sur la Plateforme. La poursuite de
                  l'utilisation de la Plateforme après modification vaut acceptation des nouvelles CGU.
                </p>

                <h2>12. Droit applicable et juridiction</h2>
                <p>
                  Les présentes CGU sont régies par le droit applicable dans le pays du siège social d'AfricaVet.
                  En cas de litige, les parties s'engagent à rechercher une solution amiable. À défaut d'accord
                  amiable, les tribunaux compétents seront saisis.
                </p>

                <h2>13. Contact</h2>
                <p>
                  Pour toute question relative aux présentes CGU, vous pouvez nous contacter :
                </p>
                <ul>
                  <li>Par e-mail : <strong>contact@africavet.com</strong></li>
                  <li>Via notre <Link to="/contact">page de contact</Link></li>
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

export default ConditionsPage;
