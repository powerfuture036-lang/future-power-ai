import { motion } from 'framer-motion'
import SEO from '@/components/common/SEO'

export default function TermsPage() {
  return (
    <>
      <SEO title="Terms of Service" />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="prose-chat space-y-4 text-muted-foreground">
          <h1 className="text-3xl font-semibold text-foreground mb-6">Terms of Service</h1>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p>By accessing Future Power AI you agree to these terms.</p>
          <h2 className="text-lg font-medium text-foreground mt-8">Service Description</h2>
          <p>Future Power AI provides an AI-powered technical assistant for power systems and a product catalog. AI responses are informational and do not constitute professional engineering certification or guarantees.</p>
          <h2 className="text-lg font-medium text-foreground mt-8">Disclaimer</h2>
          <p>Always follow local electrical codes and consult qualified professionals for installation and safety-critical decisions. We are not liable for decisions made solely based on AI output.</p>
          <h2 className="text-lg font-medium text-foreground mt-8">Acceptable Use</h2>
          <p>You agree not to misuse the platform, attempt unauthorized access, or use it for illegal purposes.</p>
          <h2 className="text-lg font-medium text-foreground mt-8">Changes</h2>
          <p>We may update these terms. Continued use constitutes acceptance of changes.</p>
        </motion.div>
      </div>
    </>
  )
}
