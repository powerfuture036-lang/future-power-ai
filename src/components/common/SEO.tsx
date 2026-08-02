import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  path?: string
  type?: string
}

export default function SEO({
  title = 'Future Power AI',
  description = 'AI Platform specialized in Generators, Solar Energy, Inverters, Batteries and Power Solutions',
  image,
  path = '',
  type = 'website'
}: SEOProps) {
  const siteUrl = import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')
  const fullTitle = title === 'Future Power AI' ? title : `${title} | Future Power AI`
  const url = `${siteUrl}${path}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  )
}
