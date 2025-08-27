import MarketingPage from "@/components/marketing-page"

export default function SecurityPage() {
  return (
    <MarketingPage
      title="Enterprise-Grade Security"
      subtitle="Best practices and safeguards to protect your organization and participants."
      sections={[
        {
          heading: "Data Protection",
          items: [
            "Encrypted at rest and in transit",
            "Role-based access controls",
            "Least-privilege operational access",
          ],
        },
        {
          heading: "Compliance & Reliability",
          items: [
            "Audit-ready logging",
            "DDoS-resilient infrastructure",
            "Regular backups and disaster recovery",
          ],
        },
      ]}
    />
  )
}
