import MarketingPage from "@/components/marketing-page"
import Link from "next/link"

export default function ContactPage() {
  return (
    <MarketingPage
      title="Contact"
      subtitle="We’re here to help with sales, support, and partnerships."
      cta={{ label: "Email Support", href: "mailto:support@hackhost.app" }}
      sections={[
        {
          heading: "How can we help?",
          items: [
            "General inquiries: support@hackhost.app",
            "Sales & partnerships: sales@hackhost.app",
            "Security disclosures: security@hackhost.app",
          ],
        },
        {
          heading: "Response Times",
          content: "We typically respond within 1 business day. Priority support is available for enterprise plans.",
        },
      ]}
    />
  )
}
