export type ProfileLink = {
  label: string;
  href: string;
};

export type ProfileEntry = {
  title: string;
  detail: string;
  status?: string;
};

export const gabrielProfile = {
  name: "Gabriel Thomas",
  firstName: "Gabriel",
  image: "/gabriel-thomas-headshot-v2.jpeg",
  // Draft copy: keep this centralized so Gabriel can approve or replace it quickly.
  tagline: "Building ideas, systems, and connections across business, technology, and civic life.",
  role: "Founder",
  company: "Elevate Systems",
  phoneDisplay: "(732) 391-9566",
  phoneHref: "+17323919566",
  publicEmail: "Gabriel.thomas449@gmail.com",
  contactEmail: "support@elevatesystems.us",
  website: "https://elevatesystems.us",
  bookingHref: "/book",
  contactCardHref: "/gabe/contact",
  socialLinks: [
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/gabriel-thomas-26b625394/"
    },
    {
      label: "X",
      href: "https://x.com/shiftusacj?s=11"
    }
  ] satisfies ProfileLink[],
  elevate: {
    eyebrow: "Founder — Elevate Systems",
    description:
      "Elevate Systems creates custom AI operations, digital experiences, and connected workflows that help businesses respond faster and work smarter.",
    capabilities: [
      "AI automation",
      "AI receptionists",
      "Digital experiences",
      "Lead management",
      "Customer follow-up",
      "Custom business systems"
    ]
  },
  civicEntries: [
    {
      title: "TPUSA",
      detail: "Professional experience",
      status: "Past work"
    },
    {
      title: "TPUSA Prep Year",
      detail: "Currently attending",
      status: "Current"
    }
  ] satisfies ProfileEntry[]
};
