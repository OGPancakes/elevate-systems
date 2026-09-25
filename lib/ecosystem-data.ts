export type EcosystemMember = {
  slug: string;
  name: string;
  relationship: "technology" | "business";
  badge: string;
  description: string;
  logoSrc: string;
  href: string;
  linkLabel: string;
  highlights: string[];
  preview?: {
    desktopSrc: string;
    mobileSrc: string;
    desktopAlt: string;
    mobileAlt: string;
  };
};

export const technologyPartners: EcosystemMember[] = [
  {
    slug: "roteo",
    name: "Roteo.ai",
    relationship: "technology",
    badge: "Technology Partner",
    description:
      "Roteo gives Elevate access to flexible AI infrastructure and API capabilities that can support the custom systems we build for clients.",
    logoSrc: "/ecosystem/roteo-logo.png",
    href: "https://www.roteo.ai/",
    linkLabel: "Visit Roteo.ai",
    highlights: ["AI infrastructure", "API connectivity", "Custom system support"]
  }
];

export const businessesWeWorkWith: EcosystemMember[] = [
  {
    slug: "feather-by-hanna",
    name: "Feather by Hanna",
    relationship: "business",
    badge: "Featured Project",
    description:
      "Elevate worked with Feather by Hanna on a refined website experience and the digital systems that support its customer journey.",
    logoSrc: "/ecosystem/feather-by-hanna-logo.png",
    href: "https://hanna.elevatesystems.us",
    linkLabel: "View the live project",
    highlights: ["Website experience", "Mobile-first design", "Connected customer journey"],
    preview: {
      desktopSrc: "/ecosystem/feather-homepage-desktop.png",
      mobileSrc: "/ecosystem/feather-homepage-mobile.png",
      desktopAlt: "Feather by Hanna homepage shown on desktop",
      mobileAlt: "Feather by Hanna homepage shown on mobile"
    }
  }
];
