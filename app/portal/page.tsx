import type { Metadata } from "next";
import { ClientPortal } from "@/components/client-portal";

export const metadata: Metadata = { title: "Client Portal | Elevate Systems", robots: { index: false, follow: false } };
export default function PortalPage() { return <ClientPortal />; }
