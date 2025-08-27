import MarketingPage from "@/components/marketing-page"

export default function PrivacyPage() {
  return (
    <MarketingPage
      title="Privacy"
      subtitle="We respect your data. Here’s how we collect, use, and protect it."
      sections={[
        {
          heading: "What We Collect",
          items: [
            "Account info (name, email)",
            "Event configuration and submissions",
            "Usage analytics to improve product quality",
          ],
        },
        {
          heading: "How We Use Data",
          items: [
            "Provide and improve HackHost services",
            "Security monitoring and abuse prevention",
            "Communications you opt into (e.g., product updates)",
          ],
        },
        {
          heading: "Your Choices",
          items: [
            "Access/modify your data",
            "Request export or deletion",
            "Control email preferences",
          ],
        },
      ]}
    />
  )
}
