import MarketingPage from "@/components/marketing-page"

export default function CareersPage() {
  return (
    <MarketingPage
      title="Careers"
      subtitle="Join us to build the future of innovation events at global scale."
      cta={{ label: "View Open Roles", href: "/contact" }}
      sections={[
        {
          heading: "Life at HackHost",
          content: "We are a product-led, remote-friendly team focused on shipping reliable systems and delightful experiences for organizers and participants alike.",
        },
        {
          heading: "Open Roles (sample)",
          items: [
            "Senior Full-Stack Engineer (Next.js/Node)",
            "Product Designer (Design Systems)",
            "Developer Relations (Community)",
          ],
        },
        {
          heading: "Benefits",
          items: ["Flexible remote work", "Learning stipend", "Wellness allowance", "Inclusive team culture"],
        },
      ]}
    />
  )
}
