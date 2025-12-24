import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
}

const defaultDescription = "Logistica - Plateforme de gestion logistique complète pour les entreprises. Gérez vos ordres de travail, clients, factures et trésorerie.";

export function SEO({
  title,
  description = defaultDescription,
  keywords = "logistique, gestion, ordres travail, factures, clients, trésorerie, comptabilité",
  image = "/favicon.png",
  url,
  type = "website",
}: SEOProps) {
  const fullTitle = `${title} | Logistica`;
  const currentUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Logistica" />
      <meta property="og:locale" content="fr_FR" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="French" />
      <meta name="author" content="Logistica" />
      <link rel="canonical" href={currentUrl} />
    </Helmet>
  );
}
