import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react'
import SEO from '@/components/common/SEO'
import { useApp } from '@/contexts/AppContext'

export default function ContactPage() {
  const { contact } = useApp()

  const items = [
    contact?.phone && { icon: Phone, label: 'Phone', value: contact.phone, href: `tel:${contact.phone}` },
    contact?.whatsapp && { icon: MessageCircle, label: 'WhatsApp', value: contact.whatsapp, href: `https://wa.me/${contact.whatsapp.replace(/\D/g, '')}` },
    contact?.email && { icon: Mail, label: 'Email', value: contact.email, href: `mailto:${contact.email}` },
    contact?.address && { icon: MapPin, label: 'Address', value: contact.address, href: contact.google_maps_url || undefined }
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string }[]

  return (
    <>
      <SEO title="Contact" description="Get in touch with Future Power AI." />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-semibold mb-2">Contact</h1>
          <p className="text-muted-foreground mb-8">Reach out for product inquiries and support.</p>

          {items.length === 0 ? (
            <p className="text-muted py-12 text-center">Contact information will appear here once configured by the owner.</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const Icon = item.icon
                const content = (
                  <div className="flex items-center gap-4 p-4 rounded-2xl glass border border-border/40 hover:border-primary/30 transition-all">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted">{item.label}</p>
                      <p className="text-sm font-medium">{item.value}</p>
                    </div>
                  </div>
                )
                return item.href ? (
                  <a key={item.label} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                    {content}
                  </a>
                ) : (
                  <div key={item.label}>{content}</div>
                )
              })}
            </div>
          )}

          {contact && (contact.facebook || contact.instagram || contact.tiktok || contact.youtube) && (
            <div className="mt-10">
              <h2 className="text-sm font-medium text-muted mb-3">Social</h2>
              <div className="flex flex-wrap gap-3">
                {contact.facebook && <a href={contact.facebook} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">Facebook</a>}
                {contact.instagram && <a href={contact.instagram} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">Instagram</a>}
                {contact.tiktok && <a href={contact.tiktok} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">TikTok</a>}
                {contact.youtube && <a href={contact.youtube} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">YouTube</a>}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </>
  )
}
