import React from "react";
import { Helmet } from "react-helmet-async";
import { getImageUrl } from "../services/api";

const SITE_NAME = "AfricaVET";
const SITE_URL = "https://www.africavet.com";
const DEFAULT_DESCRIPTION = "Le portail panafricain de la santé animale et de la médecine vétérinaire. Actualités, analyses, opportunités et ressources sur la santé animale, le One Health, les zoonoses, l'élevage, la faune sauvage, la pêche et l'aquaculture en Afrique.";
const DEFAULT_IMAGE = "/favicon.png";

const SEO = ({
  title,
  description,
  image,
  url,
  type = "website",
  article = null, // { publishedTime, modifiedTime, author, category, tags }
  noindex = false,
  jsonLd = null,
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Portail de la Médecine Vétérinaire en Afrique`;
  const metaDescription = description || DEFAULT_DESCRIPTION;
  const metaImage = image ? (image.startsWith("http") ? image : `${SITE_URL}${getImageUrl(image, DEFAULT_IMAGE)}`) : `${SITE_URL}${DEFAULT_IMAGE}`;
  const canonicalUrl = url ? `${SITE_URL}${url}` : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:locale" content="fr_FR" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Article specific OG tags */}
      {article && article.publishedTime && (
        <meta property="article:published_time" content={article.publishedTime} />
      )}
      {article && article.modifiedTime && (
        <meta property="article:modified_time" content={article.modifiedTime} />
      )}
      {article && article.author && (
        <meta property="article:author" content={article.author} />
      )}
      {article && article.category && (
        <meta property="article:section" content={article.category} />
      )}
      {article && article.tags && article.tags.map((tag, i) => (
        <meta key={i} property="article:tag" content={tag} />
      ))}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@africavet" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
