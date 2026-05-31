import React from "react";
import BreadCrumb from "../../component/BreadCrumb";
import { Link } from "react-router-dom";
import "./legal.scss";

const ConfidentialitePage = () => {
  return (
    <>
      <BreadCrumb className="shadow5" title="Politique de Confidentialité" />
      <div className="legal-page section-padding">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="legal-content">
                <h1>Politique de Confidentialité</h1>
                <p className="legal-updated">Dernière mise à jour : 29 mars 2026</p>

                <p>
                  AfricaVet accorde une importance particulière à la protection de vos données personnelles.
                  La présente Politique de Confidentialité a pour objet de vous informer sur la manière dont
                  nous collectons, utilisons, stockons et protégeons vos données lorsque vous utilisez notre
                  plateforme accessible à l'adresse <strong>www.africavet.com</strong>.
                </p>

                <h2>1. Responsable du traitement</h2>
                <p>
                  Le responsable du traitement des données personnelles collectées sur la Plateforme AfricaVet
                  est la société exploitante d'AfricaVet, joignable à l'adresse : <strong>contact@africavet.com</strong>.
                </p>

                <h2>2. Données collectées</h2>
                <h3>2.1 Données fournies directement par l'Utilisateur</h3>
                <p>Lors de votre utilisation de la Plateforme, nous pouvons collecter les données suivantes :</p>
                <ul>
                  <li><strong>Inscription</strong> : nom, prénom, adresse e-mail, pays, mot de passe (chiffré), spécialité vétérinaire</li>
                  <li><strong>Profil</strong> : photo de profil, biographie, organisation, titre professionnel</li>
                  <li><strong>E-learning</strong> : progression dans les cours, résultats de quiz, certificats obtenus</li>
                  <li><strong>Annuaire</strong> : informations professionnelles publiées volontairement (cabinet, spécialités, coordonnées professionnelles)</li>
                  <li><strong>Opportunités</strong> : CV, lettres de motivation, candidatures soumises</li>
                  <li><strong>Contact</strong> : messages envoyés via le formulaire de contact</li>
                  <li><strong>Newsletter</strong> : adresse e-mail pour l'abonnement à la newsletter</li>
                </ul>

                <h3>2.2 Données collectées automatiquement</h3>
                <ul>
                  <li>Adresse IP</li>
                  <li>Type de navigateur et système d'exploitation</li>
                  <li>Pages consultées et durée de visite</li>
                  <li>Date et heure de connexion</li>
                  <li>Données de navigation (cookies)</li>
                </ul>

                <h2>3. Finalités du traitement</h2>
                <p>Vos données personnelles sont traitées pour les finalités suivantes :</p>
                <ul>
                  <li>Gestion de votre compte utilisateur et authentification</li>
                  <li>Accès aux services de la Plateforme (e-learning, annuaire, bibliothèque, opportunités)</li>
                  <li>Délivrance de certificats de formation</li>
                  <li>Envoi de la newsletter et communications relatives au secteur vétérinaire</li>
                  <li>Publication dans l'annuaire vétérinaire panafricain (avec votre consentement)</li>
                  <li>Traitement des candidatures aux opportunités professionnelles</li>
                  <li>Amélioration de la Plateforme et de l'expérience utilisateur</li>
                  <li>Gestion des alertes vétérinaires</li>
                  <li>Respect de nos obligations légales</li>
                </ul>

                <h2>4. Base légale du traitement</h2>
                <p>Le traitement de vos données repose sur :</p>
                <ul>
                  <li><strong>Votre consentement</strong> : lors de l'inscription, de l'abonnement à la newsletter ou de la publication dans l'annuaire</li>
                  <li><strong>L'exécution du contrat</strong> : pour la fourniture des services auxquels vous avez souscrit (formations, accès à la bibliothèque)</li>
                  <li><strong>L'intérêt légitime</strong> : pour l'amélioration de la Plateforme et la sécurité du système</li>
                  <li><strong>Les obligations légales</strong> : pour le respect de la réglementation applicable</li>
                </ul>

                <h2>5. Destinataires des données</h2>
                <p>Vos données personnelles peuvent être communiquées à :</p>
                <ul>
                  <li>L'équipe interne d'AfricaVet, dans le cadre de la gestion de la Plateforme</li>
                  <li>Les prestataires techniques (hébergement, maintenance) dans la stricte mesure nécessaire</li>
                  <li>Les employeurs potentiels, uniquement pour les candidatures que vous soumettez volontairement via le module Opportunités</li>
                </ul>
                <p>
                  AfricaVet ne vend, ne loue et ne cède en aucun cas vos données personnelles à des tiers
                  à des fins commerciales.
                </p>

                <h2>6. Durée de conservation</h2>
                <p>Vos données personnelles sont conservées pour la durée suivante :</p>
                <ul>
                  <li><strong>Données de compte</strong> : pendant toute la durée de votre inscription, puis 3 ans après la dernière activité</li>
                  <li><strong>Données de formation</strong> : pendant toute la durée de votre inscription (les certificats sont conservés indéfiniment)</li>
                  <li><strong>Données de candidature</strong> : 2 ans après la soumission</li>
                  <li><strong>Données de navigation</strong> : 13 mois maximum</li>
                  <li><strong>Newsletter</strong> : jusqu'à votre désinscription</li>
                </ul>

                <h2>7. Sécurité des données</h2>
                <p>
                  AfricaVet met en oeuvre des mesures techniques et organisationnelles appropriées pour protéger
                  vos données personnelles contre tout accès non autorisé, modification, divulgation ou
                  destruction. Ces mesures incluent notamment :
                </p>
                <ul>
                  <li>Chiffrement des mots de passe (hachage bcrypt)</li>
                  <li>Communications sécurisées (HTTPS/SSL)</li>
                  <li>Authentification par jeton (JWT) avec expiration</li>
                  <li>Accès restreint aux données selon les rôles et permissions</li>
                  <li>Sauvegardes régulières des données</li>
                </ul>

                <h2>8. Cookies</h2>
                <p>
                  La Plateforme utilise des cookies pour assurer son bon fonctionnement et améliorer votre
                  expérience de navigation. Les cookies utilisés sont :
                </p>
                <ul>
                  <li><strong>Cookies essentiels</strong> : nécessaires au fonctionnement de la Plateforme (authentification, préférences de session)</li>
                  <li><strong>Cookies de performance</strong> : pour analyser l'utilisation de la Plateforme et en améliorer les performances</li>
                </ul>
                <p>
                  Vous pouvez configurer votre navigateur pour refuser les cookies. Toutefois, certaines
                  fonctionnalités de la Plateforme pourraient ne plus être disponibles.
                </p>

                <h2>9. Vos droits</h2>
                <p>
                  Conformément à la réglementation applicable en matière de protection des données personnelles,
                  vous disposez des droits suivants :
                </p>
                <ul>
                  <li><strong>Droit d'accès</strong> : obtenir la confirmation que vos données sont traitées et en obtenir une copie</li>
                  <li><strong>Droit de rectification</strong> : corriger vos données inexactes ou incomplètes</li>
                  <li><strong>Droit de suppression</strong> : demander l'effacement de vos données dans les conditions prévues par la loi</li>
                  <li><strong>Droit d'opposition</strong> : vous opposer au traitement de vos données pour des motifs légitimes</li>
                  <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré et lisible par machine</li>
                  <li><strong>Droit de retrait du consentement</strong> : retirer votre consentement à tout moment sans affecter la licéité du traitement antérieur</li>
                </ul>
                <p>
                  Pour exercer vos droits, contactez-nous à l'adresse : <strong>contact@africavet.com</strong>.
                  Nous nous engageons à répondre à votre demande dans un délai de 30 jours.
                </p>

                <h2>10. Newsletter</h2>
                <p>
                  En vous abonnant à la newsletter AfricaVet, vous consentez à recevoir des communications
                  relatives à l'actualité vétérinaire, aux nouvelles formations et aux opportunités professionnelles.
                  Vous pouvez vous désabonner à tout moment en cliquant sur le lien de désinscription présent
                  dans chaque e-mail ou en vous rendant sur votre <Link to="/profil">page de profil</Link>.
                </p>

                <h2>11. Transfert de données</h2>
                <p>
                  Vos données sont hébergées sur des serveurs sécurisés. En cas de transfert de données en dehors
                  de votre pays de résidence, AfricaVet s'assure que des garanties appropriées sont mises en
                  place conformément à la réglementation applicable.
                </p>

                <h2>12. Modification de la politique</h2>
                <p>
                  AfricaVet se réserve le droit de modifier la présente Politique de Confidentialité à tout moment.
                  Toute modification sera publiée sur cette page avec une date de mise à jour. Nous vous informerons
                  des modifications substantielles par e-mail ou notification sur la Plateforme.
                </p>

                <h2>13. Contact</h2>
                <p>
                  Pour toute question relative à la protection de vos données personnelles, vous pouvez
                  nous contacter :
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

export default ConfidentialitePage;
