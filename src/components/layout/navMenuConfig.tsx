export interface NavMenuItem {
  label: string;
  href: string;
  description?: string;
}
export interface NavMenuSection {
  title: string;
  items: NavMenuItem[];
}
export const navMenuConfig: NavMenuSection[] = [
  {
    title: "Find Lawyers",
    items: [
      { label: "By Practice Area", href: "/signup?role=client", description: "Browse lawyers by specialization" },
      { label: "By City / Location", href: "/signup?role=client", description: "Find lawyers near you" },
      { label: "By Language", href: "/signup?role=client", description: "Lawyers who speak your language" },
      { label: "Top Rated", href: "/signup?role=client", description: "Highest rated legal professionals" },
      { label: "Available Now", href: "/signup?role=client", description: "Lawyers ready for consultation" },
      { label: "Verified Lawyers", href: "/signup?role=client", description: "Platform-verified attorneys" },
      { label: "Free Consultation", href: "/signup?role=client", description: "Lawyers offering free first session" },
    ],
  },
  {
    title: "Services",
    items: [
      { label: "Consultation", href: "/lawyers", description: "One-on-one legal advice sessions" },
      { label: "Document Drafting", href: "/lawyers?service=drafting", description: "Legal document preparation" },
      { label: "Case Representation", href: "/lawyers?service=representation", description: "Full case handling & court representation" },
      { label: "Startup Legal Help", href: "/lawyers?service=startup", description: "Incorporation, compliance & contracts" },
      { label: "Property Legal Help", href: "/lawyers?service=property", description: "Real estate & property disputes" },
      { label: "Criminal Defense", href: "/lawyers?service=criminal", description: "Criminal law representation" },
      { label: "Family Law Help", href: "/lawyers?service=family", description: "Divorce, custody & family matters" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Blog", href: "#", description: "Latest legal insights & news" },
      { label: "Legal Guides", href: "#", description: "Step-by-step legal how-tos" },
      { label: "FAQs", href: "#", description: "Common legal questions answered" },
      { label: "Templates", href: "#", description: "Free legal document templates" },
      { label: "Articles", href: "#", description: "In-depth legal analysis" },
    ],
  },
  {
    title: "For Lawyers",
    items: [
      { label: "Join Platform", href: "/signup?role=lawyer", description: "Register as a legal professional" },
      { label: "Benefits", href: "#", description: "Why lawyers choose LegalMate" },
      { label: "Pricing", href: "#", description: "Transparent platform fees" },
      // { label: "Dashboard Preview", href: "/for-lawyers/preview", description: "See your future workspace" },
      // { label: "Success Stories", href: "/for-lawyers/stories", description: "Hear from top performers" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About Us", href: "#", description: "Our mission & team" },
      { label: "How It Works", href: "#", description: "Simple 3-step process" },
      { label: "Contact", href: "/contact", description: "Get in touch with us" },
      { label: "Privacy Policy", href: "/privacy", description: "How we protect your data" },
      { label: "Terms", href: "/terms", description: "Terms of service" },
      { label: "Refund Policy", href: "/refund", description: "Our refund & cancellation policy" },
    ],
  },
];
