import { motion } from 'framer-motion'
import SEO from '@/components/common/SEO'
import { useApp } from '@/contexts/AppContext'

export default function AboutPage() {
  const { contact, siteSettings } = useApp()

  return (
    <>
      <SEO title="About" description="About Future Power AI - Your expert partner in power solutions." />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-semibold mb-6">About Us</h1>
          <div className="prose-chat space-y-4 text-muted-foreground">
            <p>
              {siteSettings?.tagline ||
                'Future Power AI is an intelligent platform dedicated to generators, solar energy systems, inverters, batteries, ATS, AVR and complete power solutions.'}
            </p>
            <p>
              Our AI assistant provides expert technical guidance on sizing, installation, maintenance, troubleshooting and energy calculations — available 24/7.
            </p>
            <p>
              The company focuses on delivering quality products and professional support. All product information, pricing and contact details are managed directly by the owner.
            </p>
            {contact?.company_name && (
              <p className="text-foreground font-medium mt-8">{contact.company_name}</p>
            )}
          </div>
        </motion.div>
      </div>
    </>
  )
}
