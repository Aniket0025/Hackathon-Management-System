import MarketingPage from "@/components/marketing-page"

export default function APIReferencePage() {
  return (
    <MarketingPage
      title="API Reference"
      subtitle="Integrate with HackHost programmatically using our REST APIs."
      cta={{ label: "Get Started", href: "/docs" }}
      sections={[
        {
          heading: "Auth",
          items: [
            "POST /api/auth/login",
            "POST /api/auth/register",
            "GET /api/auth/me",
          ],
        },
        {
          heading: "Events",
          items: [
            "GET /api/events",
            "POST /api/events",
            "GET /api/events/:id",
          ],
        },
        {
          heading: "Submissions",
          items: [
            "POST /api/submissions",
            "GET /api/submissions?eventId=...",
          ],
        },
      ]}
    />
  )
}
