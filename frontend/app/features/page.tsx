import MarketingPage from "@/components/marketing-page"

export default function FeaturesPage() {
  return (
    <MarketingPage
      title="Powerful Features"
      subtitle="Everything you need to plan, run, and scale world-class hackathons."
      cta={{ label: "Start Your Event", href: "/auth/register" }}
      sections={[
        {
          heading: "Organizer Suite",
          items: [
            "Event creation with templates",
            "Multi-track + multi-round judging",
            "Mentor/mentor-slot scheduling",
            "Sponsor management",
          ],
        },
        {
          heading: "Participant Experience",
          items: [
            "Smart team matching",
            "Project submission workflows",
            "Live updates and announcements",
            "Built-in community feed",
          ],
        },
        {
          heading: "Insights & Automation",
          items: [
            "Real-time analytics dashboard",
            "Automated scoring aggregation",
            "Email/SMS notifications",
            "Exportable reports",
          ],
        },
      ]}
    />
  )
}
