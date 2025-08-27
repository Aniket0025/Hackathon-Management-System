import MarketingPage from "@/components/marketing-page"

export default function DocsPage() {
  return (
    <MarketingPage
      title="Documentation"
      subtitle="Guides and references to help you integrate and operate HackHost."
      cta={{ label: "View API Reference", href: "/api-reference" }}
      sections={[
        {
          heading: "Getting Started",
          items: [
            "Create your first event",
            "Invite organizers and judges",
            "Configure tracks and scoring",
          ],
        },
        {
          heading: "Operations",
          items: [
            "Manage registrations",
            "Run judging rounds",
            "Publish winners and reports",
          ],
        },
      ]}
    />
  )
}
