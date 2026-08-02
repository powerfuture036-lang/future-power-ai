import { motion } from 'framer-motion'
import SEO from '@/components/common/SEO'

export default function PrivacyPage() {
  return (
    <>
      <SEO title="Privacy Policy" />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="prose-chat space-y-4 text-muted-foreground">
          <h1 className="text-3xl font-semibold text-foreground mb-6">Privacy Policy</h1>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p>Future Power AI ("we", "our", or "us") respects your privacy. This policy explains how we collect, use and protect information when you use our platform.</p>
          <h2 className="text-lg font-medium text-foreground mt-8">Information We Collect</h2>
          <p>We may collect conversation content you send to the AI assistant, technical identifiers (browser fingerprint for conversation history), and contact information you voluntarily provide.</p>
          <h2 className="text-lg font-medium text-foreground mt-8">How We Use Information</h2>
          <p>Conversation data is used to provide AI responses and maintain chat history on your device/session. We do not sell personal data.</p>
          <h2 className="text-lg font-medium text-foreground mt-8">Third-Party Services</h2>
          <p>We use Supabase for data storage and OpenRouter for AI inference. Their respective privacy policies apply to data processed by those services.</p>
          <h2 className="text-lg font-medium text-foreground mt-8">Contact</h2>
          <p>For privacy inquiries, please use the contact information available on our Contact page.</p>
        </motion.div>
      </div>
    </>
  )
}
