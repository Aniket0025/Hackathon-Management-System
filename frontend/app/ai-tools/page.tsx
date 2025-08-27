import MarketingPage from "@/components/marketing-page"

export default function AIToolsPage() {
  return (
    <MarketingPage
      title="AI Tools"
      subtitle="Boost efficiency with AI-assisted workflows across your hackathon lifecycle."
      cta={{ label: "Explore Analytics", href: "/analytics" }}
      sections={[
        {
          heading: "For Organizers",
          items: [
            "AI suggestions for judging criteria",
            "Auto-categorize projects by theme",
            "Smart scheduling recommendations",
          ],
        },
        {
          heading: "For Participants",
          items: [
            "Team matchmaking based on skills",
            "Project idea generation prompts",
            "Submission linting and completeness checks",
          ],
        },
      ]}
    />
  )
}
