import React from 'react';
import { Helmet } from 'react-helmet-async';

export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  keywords?: string;
  noindex?: boolean;
  productPrice?: number;
  productCurrency?: string;
  productAvailability?: 'in stock' | 'out of stock';
}

const DEFAULT_TITLE = 'Maryam Sparkle | Handmade Jewellery';
const DEFAULT_DESCRIPTION =
  'Handmade artisanal jewellery crafted with love, inspired by nature and little moments of life. Discover beaded bracelets, delicate necklaces, rings, and custom bespoke pieces in Pakistan.';
const DEFAULT_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDmeq-VwhiU435DetS1X3uFs7ftPFTXuoNQPezkt-FDdS5fVi-fWgAQ_3PvJaDU9x4xRw9sw7ru1NTVm_zs5SnnAjgi_E2wg681wIyMw8JV9vSVAfWYzcpF2UkfNK-BMxse2gjK2A1h8e3yxiOCNiD2WAJBuG3Iw-g3MZVUEn1s8s125YRifRsnzPAXqmvTSBCjOEOnUJwZJOSA8TQuT8SgzakSJP9LOMTUZ0VMg55dfVKNyPJBWwEe';
const SITE_NAME = 'Maryam Sparkle';

export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  keywords,
  noindex = false,
  productPrice,
  productCurrency = 'PKR',
  productAvailability = 'in stock',
}) => {
  const formattedTitle = title
    ? title.includes(SITE_NAME)
      ? title
      : `${title} | ${SITE_NAME}`
    : DEFAULT_TITLE;

  const currentUrl =
    typeof window !== 'undefined'
      ? canonical
        ? `${window.location.origin}${canonical.startsWith('/') ? canonical : `/${canonical}`}`
        : window.location.href
      : '';

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{formattedTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      {currentUrl && <link rel="canonical" href={currentUrl} />}

      {/* Open Graph Meta Tags */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      {currentUrl && <meta property="og:url" content={currentUrl} />}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={formattedTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Product Open Graph Rich Tags */}
      {ogType === 'product' && productPrice !== undefined && (
        <meta property="product:price:amount" content={productPrice.toString()} />
      )}
      {ogType === 'product' && (
        <meta property="product:price:currency" content={productCurrency} />
      )}
      {ogType === 'product' && (
        <meta property="product:availability" content={productAvailability} />
      )}
    </Helmet>
  );
};
