"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  ChevronDown,
  Layers3,
  Menu,
  ScanSearch,
  SlidersHorizontal,
  X
} from "lucide-react";

import { Button } from "@/components/ui/button";

const standardNav = [
  { label: "Pricing", href: "/pricing" },
  { label: "Proof", href: "/proof" },
  { label: "Contact", href: "/#contact" }
];

const exploreNav = [
  {
    label: "Services",
    description: "Websites, automation, CRM, and connected business systems.",
    href: "/services",
    icon: BriefcaseBusiness
  },
  {
    label: "Product Demos",
    description: "Step inside Elevate Orders and the growing product family.",
    href: "/demos",
    icon: Layers3
  }
];

const aiNav = [
  {
    label: "AI Planner",
    description: "Explore systems and estimate potential time savings.",
    href: "/ai-planner",
    icon: SlidersHorizontal
  },
  {
    label: "AI Solutions",
    description: "Explore assistants, reception, follow-up, and operations.",
    href: "/ai-solutions",
    icon: Bot
  },
  {
    label: "Website Audit",
    description: "Scan your current site and preview what it could become.",
    href: "/audit",
    icon: ScanSearch
  }
];

export function SiteHeader() {
  const [aiOpen, setAiOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!navRef.current?.contains(event.target as Node)) {
        setAiOpen(false);
        setExploreOpen(false);
      }
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-[#030711]/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
        <Link className="flex items-center" href="/" aria-label="Elevate Systems home">
          <Image
            alt="Elevate Systems logo"
            className="h-16 w-28 object-contain sm:h-[70px] sm:w-32"
            height={70}
            src="/elevate-logo-transparent.png"
            width={128}
            priority
          />
        </Link>

        <div className="hidden items-center gap-1 md:flex" ref={navRef}>
          <div className="relative">
            <button
              aria-expanded={aiOpen}
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
              onClick={() => {
                setAiOpen((value) => !value);
                setExploreOpen(false);
              }}
              type="button"
            >
              AI
              <ChevronDown className={`h-4 w-4 transition ${aiOpen ? "rotate-180" : ""}`} />
            </button>
            <div
              className={`nav-dropdown absolute left-0 top-[calc(100%+0.75rem)] w-80 origin-top-left border border-white/10 bg-[#07101d]/95 p-2 shadow-2xl backdrop-blur-xl ${
                aiOpen ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-2 scale-95 opacity-0"
              }`}
            >
              {aiNav.map((item) => (
                <Link
                  className="nav-dropdown-item group flex gap-3 p-3"
                  href={item.href}
                  key={item.label}
                  onClick={() => setAiOpen(false)}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-sky-300/15 bg-sky-300/[0.06] text-sky-300">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-white">{item.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-white/40">{item.description}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <div className="relative">
            <button
              aria-expanded={exploreOpen}
              className="nav-motion flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white"
              onClick={() => {
                setExploreOpen((value) => !value);
                setAiOpen(false);
              }}
              type="button"
            >
              Explore
              <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${exploreOpen ? "rotate-180" : ""}`} />
            </button>
            <div
              className={`nav-dropdown absolute left-0 top-[calc(100%+0.75rem)] w-80 origin-top-left border border-white/10 bg-[#07101d]/95 p-2 shadow-2xl backdrop-blur-xl ${
                exploreOpen ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-2 scale-95 opacity-0"
              }`}
            >
              {exploreNav.map((item) => (
                <Link
                  className="nav-dropdown-item group flex gap-3 p-3"
                  href={item.href}
                  key={item.label}
                  onClick={() => setExploreOpen(false)}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-sky-300/15 bg-sky-300/[0.06] text-sky-300">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-white">{item.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-white/40">{item.description}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
          {standardNav.map((item) => (
            <Link
              className="nav-motion rounded-md px-3 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white"
              href={item.href}
              key={item.label}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/book">
              Book a Call
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <button
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            className="flex h-10 w-10 items-center justify-center border border-white/10 text-white md:hidden"
            onClick={() => setMobileOpen((value) => !value)}
            type="button"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <div
        className={`overflow-hidden border-t border-white/10 bg-[#050b15] transition-[max-height,opacity] duration-300 md:hidden ${
          mobileOpen ? "max-h-[82vh] overflow-y-auto opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-7xl space-y-1 px-5 py-5">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">AI tools</p>
          {aiNav.map((item) => (
            <Link
              className="flex items-center gap-3 border-b border-white/10 px-3 py-4"
              href={item.href}
              key={item.label}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon className="h-5 w-5 text-sky-300" />
              <span>
                <span className="block text-sm font-medium text-white">{item.label}</span>
                <span className="mt-1 block text-xs text-white/40">{item.description}</span>
              </span>
            </Link>
          ))}
          <p className="px-3 pb-1 pt-5 text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">Explore</p>
          {exploreNav.map((item) => (
            <Link
              className="mobile-nav-item flex items-center gap-3 border-b border-white/10 px-3 py-4"
              href={item.href}
              key={item.label}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon className="h-5 w-5 text-sky-300" />
              <span>
                <span className="block text-sm font-medium text-white">{item.label}</span>
                <span className="mt-1 block text-xs text-white/40">{item.description}</span>
              </span>
            </Link>
          ))}
          {standardNav.map((item) => (
            <Link
              className="block border-b border-white/10 px-3 py-4 text-sm text-white/70"
              href={item.href}
              key={item.label}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Button asChild className="mt-4 w-full sm:hidden">
            <Link href="/book" onClick={() => setMobileOpen(false)}>
              Book a Call
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

    </header>
  );
}
