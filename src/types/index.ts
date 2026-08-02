export type ProductStatus = 'available' | 'unavailable' | 'coming_soon' | 'limited' | 'sold' | 'rental'

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  short_description?: string
  price: number | null
  currency: string
  status: ProductStatus
  category_id: string | null
  brand: string | null
  power: string | null
  fuel: string | null
  frequency: string | null
  voltage: string | null
  specifications: Record<string, string> | null
  features: string[] | null
  is_featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
  images?: ProductImage[]
  category?: Category
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  storage_path: string
  alt: string | null
  is_primary: boolean
  sort_order: number
  type: 'image' | 'video' | 'pdf'
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  sort_order: number
  parent_id: string | null
}

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image: string | null
  category_id: string | null
  author: string | null
  is_featured: boolean
  is_published: boolean
  seo_title: string | null
  seo_description: string | null
  tags: string[] | null
  published_at: string | null
  created_at: string
  updated_at: string
  category?: Category
  views?: number
}

export interface ContactInfo {
  id: string
  phone: string | null
  whatsapp: string | null
  email: string | null
  address: string | null
  google_maps_url: string | null
  facebook: string | null
  instagram: string | null
  tiktok: string | null
  youtube: string | null
  logo_url: string | null
  cover_image_url: string | null
  company_name: string | null
  working_hours: string | null
  updated_at: string
}

export interface AISettings {
  id: string
  api_key_encrypted: string | null
  default_model: string
  system_prompt: string
  temperature: number
  max_tokens: number
  model_routing: Record<string, string> | null
  enable_suggestions: boolean
  enable_memory: boolean
  updated_at: string
}

export interface Conversation {
  id: string
  title: string
  user_fingerprint: string | null
  created_at: string
  updated_at: string
  message_count?: number
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  attachments: Attachment[] | null
  model_used: string | null
  tokens_used: number | null
  created_at: string
}

export interface Attachment {
  type: 'image' | 'pdf' | 'video'
  url: string
  name: string
  size?: number
  mime?: string
}

export interface SiteSettings {
  id: string
  site_name: string
  tagline: string | null
  primary_color: string
  accent_color: string
  maintenance_mode: boolean
  allow_guest_chat: boolean
  default_language: string
  seo_title: string | null
  seo_description: string | null
  updated_at: string
}

export interface Admin {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  is_active: boolean
  last_login: string | null
  created_at: string
}

export type ChatSuggestion = string

export interface OpenRouterModel {
  id: string
  name: string
  description?: string
  context_length?: number
  pricing?: {
    prompt: string
    completion: string
  }
}

export interface ActivityLog {
  id: string
  action: string
  entity_type: string | null
  entity_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}
