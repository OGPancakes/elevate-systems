"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bot, ChevronDown, Menu, ScanSearch, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const standardNav = [
  { label: "Services", href: "/services" },
  { label: "Proof", href: "/proof" },
  { label: "Contact", href: "/#contact" }
];

const aiNav = [
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) setAiOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-[#030711]/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
        <Link className="flex items-center gap-3" href="/" aria-label="Elevate Systems home">
          <Image
            alt="Elevate Systems logo"
            className="h-14 w-14 object-contain sm:h-16 sm:w-16"
            height={64}
            src="/elevate-logo.png"
            width={64}
            priority
          />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold tracking-[0.18em] text-white">ELEVATE</p>
            <p className="text-xs tracking-[0.28em] text-sky-300">SYSTEMS</p>
          </div>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <div className="relative" ref={dropdownRef}>
            <button
              aria-expanded={aiOpen}
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
              onClick={() => setAiOpen((value) => !value)}
              type="button"
            >
              AI
              <ChevronDown className={`h-4 w-4 transition ${aiOpen ? "rotate-180" : ""}`} />
            </button>
            <div
              className={`absolute left-0 top-[calc(100%+0.75rem)] w-80 origin-top-left border border-white/10 bg-[#07101d]/95 p-2 shadow-2xl backdrop-blur-xl transition duration-200 ${
                aiOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
              }`}
            >
              {aiNav.map((item) => (
                <Link
                  className="group flex gap-3 p-3 transition hover:bg-white/[0.06]"
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
          {standardNav.map((item) => (
            <Link
              className="rounded-md px-3 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
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
          mobileOpen ? "max-h-[540px] opacity-100" : "max-h-0 opacity-0"
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
