import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Services", href: "/services" },
  { label: "Audit", href: "/audit" },
  { label: "Proof", href: "/proof" },
  { label: "Contact", href: "/#contact" }
];

export function SiteHeader() {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-[#030711]/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
        <Link className="flex items-center gap-3" href="/" aria-label="Elevate Systems home">
          <Image
            alt="Elevate Systems logo"
            className="h-10 w-10 rounded-md object-cover"
            height={40}
            src="/elevate-logo.png"
            width={40}
            priority
          />
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-white">ELEVATE</p>
            <p className="text-xs tracking-[0.28em] text-sky-300">SYSTEMS</p>
          </div>
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              className="rounded-md px-3 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
              href={item.href}
              key={item.label}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <Button asChild>
          <Link href="/book">
            Book a Call
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </nav>
    </header>
  );
}
