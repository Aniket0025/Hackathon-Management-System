import MarketingPage from "@/components/marketing-page"

export default function BestPracticesPage() {
  return (
    <MarketingPage
      title="Best Practices"
      subtitle="Battle-tested tips for planning, running, and wrapping up successful hackathons."
      cta={{ label: "Read Documentation", href: "/docs" }}
      sections={[
        {
          heading: "Plan (4–6 weeks out)",
          items: [
            "Define goals, tracks, judging criteria",
            "Publish timeline and code of conduct",
            "Recruit mentors, judges, and sponsors",
            "Set up submissions and scoring rubric",
          ],
        },
        {
          heading: "Run (event week)",
          items: [
            "Kickoff with clear rules and comms channels",
            "Schedule mentor hours and office hours",
            "Send timely updates (milestones, deadlines)",
            "Dry run judging process and tech",
          ],
        },
        {
          heading: "Wrap (post-event)",
          items: [
            "Publish winners and recordings",
            "Share project gallery and resources",
            "Collect feedback from all roles",
            "Send certificates and post-mortem report",
          ],
        },
        {
          heading: "Anti‑patterns to avoid",
          items: [
            "Unclear scope or last‑minute rule changes",
            "Judging without a rubric",
            "Single comms channel for everything",
            "No buffer time for demos and Q&A",
          ],
        },
      ]}
    />
  )
}
