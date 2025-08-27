import MarketingPage from "@/components/marketing-page"

export default function AboutPage() {
  return (
    <MarketingPage
      title="About HackHost"
      subtitle="We build the world's most advanced platform for innovation events."
      cta={{ label: "Contact Us", href: "/contact" }}
      sections={[
        {
          heading: "Our Mission",
          content: "Empower organizers and participants to accelerate ideas into impact through seamless event operations, AI-powered insights, and a vibrant community.",
        },
        {
          heading: "What We Value",
          items: ["Customer obsession", "Reliability at scale", "Privacy and security by design", "Inclusive community"],
        },
        {
          heading: "The Team",
          content: "HackHost is built by event operators, engineers, and designers who have run hackathons from 50 to 50,000 participants.",
        },
      ]}
    />
  )
}
