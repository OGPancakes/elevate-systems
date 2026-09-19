import type { Metadata } from "next";

import { GabrielDigitalCard } from "@/components/gabriel-digital-card";
import { gabrielProfile } from "@/lib/gabriel-profile";

export const metadata: Metadata = {
  title: "Gabriel Thomas | Digital Business Card",
  description: gabrielProfile.tagline,
  alternates: {
    canonical: "/gabe"
  },
  openGraph: {
    title: "Gabriel Thomas",
    description: gabrielProfile.tagline,
    type: "profile",
    url: "/gabe",
    images: [
      {
        url: gabrielProfile.image,
        width: 800,
        height: 800,
        alt: "Gabriel Thomas"
      }
    ]
  },
  twitter: {
    card: "summary",
    title: "Gabriel Thomas",
    description: gabrielProfile.tagline,
    images: [gabrielProfile.image]
  }
};

export default function GabrielPage() {
  return <GabrielDigitalCard />;
}
