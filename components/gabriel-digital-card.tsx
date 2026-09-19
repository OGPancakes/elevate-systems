"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  Linkedin,
  Mail,
  Megaphone,
  MessageCircle,
  Phone,
  Share2,
  Sparkles,
  X,
  XIcon
} from "lucide-react";

import { gabrielProfile } from "@/lib/gabriel-profile";

const quickActions = [
  {
    label: "Call",
    href: `tel:${gabrielProfile.phoneHref}`,
    icon: Phone
  },
  {
    label: "Text",
    href: `sms:${gabrielProfile.phoneHref}`,
    icon: MessageCircle
  },
  {
    label: "Email",
    href: `mailto:${gabrielProfile.publicEmail}`,
    icon: Mail
  }
];

async function copyPageUrl() {
  const url = window.location.href;

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = url;
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  textArea.remove();
}

export function GabrielDigitalCard() {
  const [connectOpen, setConnectOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openSection, setOpenSection] = useState<"elevate" | "civic" | "media" | null>(null);

  useEffect(() => {
    if (!connectOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setConnectOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [connectOpen]);

  async function shareCard() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${gabrielProfile.name} — Digital Card`,
          text: `Connect with ${gabrielProfile.name}.`,
          url: window.location.href
        });
        return;
      }

      await copyPageUrl();
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      await copyPageUrl();
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  }

  return (
    <main className="gabe-shell relative min-h-screen overflow-hidden bg-[#030711] text-white">
      <div className="gabe-grid pointer-events-none fixed inset-0 opacity-60" />
      <div className="gabe-ambient gabe-ambient-one" />
      <div className="gabe-ambient gabe-ambient-two" />

      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
        <header className="gabe-enter flex items-center justify-between pb-4">
          <Link className="flex flex-col items-start" href="/gabe" aria-label="Gabriel Thomas digital card">
            <span className="gabe-signature text-[1.65rem] leading-none text-white">Gabriel Thomas</span>
            <span className="mt-1 block text-[0.62rem] font-medium uppercase tracking-[0.22em] text-sky-300/70">
              Digital card
            </span>
          </Link>
          <button
            aria-label="Share this digital card"
            className="grid h-10 w-10 place-items-center border border-white/10 bg-white/[0.04] text-white/60 hover:border-sky-300/30 hover:text-sky-200"
            onClick={shareCard}
            type="button"
          >
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          </button>
        </header>

        <section className="gabe-enter pb-14 pt-10 text-center sm:pb-16 sm:pt-14">
          <div className="gabe-avatar-ring mx-auto h-40 w-40 sm:h-44 sm:w-44">
            <Image
              alt="Gabriel Thomas"
              className="h-full w-full object-cover"
              fill
              priority
              sizes="(max-width: 640px) 160px, 176px"
              src={gabrielProfile.image}
            />
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
            Founder · Builder · Connector
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            {gabrielProfile.name}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-balance text-base leading-7 text-white/58 sm:text-lg sm:leading-8">
            {gabrielProfile.tagline}
          </p>
          <p className="mt-3 text-sm text-white/38">
            {gabrielProfile.role} at {gabrielProfile.company}
          </p>

          <div className="mx-auto mt-7 grid max-w-md grid-cols-2 gap-3">
            <a
              className="gabe-primary-action flex min-h-12 items-center justify-center gap-2 bg-sky-500 px-4 text-sm font-semibold text-white hover:bg-sky-400"
              href={gabrielProfile.contactCardHref}
            >
              <Download className="h-4 w-4" />
              Save Contact
            </a>
            <button
              className="flex min-h-12 items-center justify-center gap-2 border border-white/12 bg-white/[0.06] px-4 text-sm font-semibold text-white hover:border-sky-300/35 hover:bg-white/[0.1]"
              onClick={() => setConnectOpen(true)}
              type="button"
            >
              <Sparkles className="h-4 w-4 text-sky-300" />
              Connect
            </button>
          </div>

          <div className="mx-auto mt-3 grid max-w-md grid-cols-3 gap-3" aria-label="Quick contact actions">
            {quickActions.map((action) => (
              <a
                className="gabe-quick-action flex min-h-[4.25rem] flex-col items-center justify-center gap-1.5 border border-white/10 bg-white/[0.025] text-xs font-medium text-white/55 hover:border-sky-300/30 hover:bg-sky-300/[0.06] hover:text-white"
                href={action.href}
                key={action.label}
              >
                <action.icon className="h-4 w-4 text-sky-300" />
                {action.label}
              </a>
            ))}
          </div>
        </section>

        <section className="gabe-enter py-3">
          <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/30">
            Explore my work
          </p>

          <div className="space-y-2">
            <div className={`overflow-hidden bg-white/[0.025] ${openSection === "elevate" ? "bg-sky-300/[0.035]" : ""}`}>
              <button
                aria-controls="elevate-profile-section"
                aria-expanded={openSection === "elevate"}
                className="flex w-full items-center gap-4 px-3 py-4 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-sky-300/35"
                onClick={() => setOpenSection((current) => (current === "elevate" ? null : "elevate"))}
                type="button"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center bg-sky-300/[0.06] text-sky-300">
                  <Image alt="Elevate Systems" height={32} src="/elevate-logo-transparent.png" width={32} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-white">Elevate Systems</span>
                  <span className="mt-1 block text-xs text-white/40">Company, systems, and technology</span>
                </span>
                <ChevronDown className={`h-4 w-4 text-white/35 transition-transform ${openSection === "elevate" ? "rotate-180" : ""}`} />
              </button>

              {openSection === "elevate" ? (
                <div className="gabe-accordion-content px-4 pb-5 pt-1 sm:pl-[4.25rem] sm:pr-5" id="elevate-profile-section">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
                    {gabrielProfile.elevate.eyebrow}
                  </p>
                  <h2 className="mt-3 text-xl font-semibold leading-7 text-white sm:text-2xl">
                    Building useful technology around how businesses actually work.
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
                    {gabrielProfile.elevate.description}
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {gabrielProfile.elevate.capabilities.map((capability) => (
                      <span className="flex items-center gap-2 text-sm text-white/58" key={capability}>
                        <span className="h-1 w-1 rounded-full bg-sky-300" />
                        {capability}
                      </span>
                    ))}
                  </div>
                  <Link
                    className="animated-link mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky-300 hover:text-white"
                    href="/"
                  >
                    Explore Elevate Systems
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : null}
            </div>

            <div className={`overflow-hidden bg-white/[0.025] ${openSection === "civic" ? "bg-sky-300/[0.035]" : ""}`}>
              <button
                aria-controls="civic-profile-section"
                aria-expanded={openSection === "civic"}
                className="flex w-full items-center gap-4 px-3 py-4 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-sky-300/35"
                onClick={() => setOpenSection((current) => (current === "civic" ? null : "civic"))}
                type="button"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center bg-white/[0.035] text-sky-300">
                  <BriefcaseBusiness className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-white">Civic involvement</span>
                  <span className="mt-1 block text-xs text-white/40">Programs and professional experience</span>
                </span>
                <ChevronDown className={`h-4 w-4 text-white/35 transition-transform ${openSection === "civic" ? "rotate-180" : ""}`} />
              </button>

              {openSection === "civic" ? (
                <div className="gabe-accordion-content px-4 pb-5 pt-1 sm:pl-[4.25rem] sm:pr-5" id="civic-profile-section">
                  <p className="max-w-md text-sm leading-6 text-white/45">
                    A growing record of civic programs and professional involvement.
                  </p>
                  <div className="mt-3 grid gap-2">
                    {gabrielProfile.civicEntries.map((entry) => (
                      <div className="flex items-center justify-between gap-4 bg-white/[0.025] px-3 py-3" key={entry.title}>
                        <span>
                          <span className="block text-sm font-semibold text-white">{entry.title}</span>
                          <span className="mt-1 block text-xs text-white/40">{entry.detail}</span>
                        </span>
                        {entry.status ? (
                          <span className="shrink-0 text-xs font-medium text-white/32">{entry.status}</span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className={`overflow-hidden bg-white/[0.025] ${openSection === "media" ? "bg-sky-300/[0.035]" : ""}`}>
              <button
                aria-controls="media-profile-section"
                aria-expanded={openSection === "media"}
                className="flex w-full items-center gap-4 px-3 py-4 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-sky-300/35"
                onClick={() => setOpenSection((current) => (current === "media" ? null : "media"))}
                type="button"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center bg-white/[0.035] text-sky-300">
                  <Megaphone className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-white">Marketing &amp; social media</span>
                  <span className="mt-1 block text-xs text-white/40">Content strategy and audience growth</span>
                </span>
                <ChevronDown className={`h-4 w-4 text-white/35 transition-transform ${openSection === "media" ? "rotate-180" : ""}`} />
              </button>

              {openSection === "media" ? (
                <div className="gabe-accordion-content px-4 pb-5 pt-1 sm:pl-[4.25rem] sm:pr-5" id="media-profile-section">
                  <p className="max-w-md text-sm leading-6 text-white/45">
                    Social media and TikTok marketing focused on content reach and audience engagement.
                  </p>
                  <div className="mt-3 grid gap-2">
                    {gabrielProfile.mediaEntries.map((entry) => (
                      <div className="flex items-center justify-between gap-4 bg-white/[0.025] px-3 py-3" key={entry.title}>
                        <span>
                          <span className="block text-sm font-semibold text-white">{entry.title}</span>
                          <span className="mt-1 block text-xs text-white/40">{entry.detail}</span>
                        </span>
                        {entry.status ? (
                          <span className="max-w-24 shrink-0 text-right text-xs font-medium leading-5 text-sky-200/70">
                            {entry.status}
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="gabe-enter py-10 text-center sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">Stay connected</p>
          <h2 className="mx-auto mt-3 max-w-lg text-3xl font-semibold text-white">
            Let’s keep the conversation going.
          </h2>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              className="gabe-primary-action inline-flex min-h-12 items-center justify-center gap-2 bg-sky-500 px-6 text-sm font-semibold text-white hover:bg-sky-400"
              href={gabrielProfile.bookingHref}
            >
              <CalendarDays className="h-4 w-4" />
              Book a Meeting
            </Link>
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/12 bg-white/[0.05] px-6 text-sm font-semibold text-white hover:border-sky-300/35"
              onClick={() => setConnectOpen(true)}
              type="button"
            >
              View All Connections
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        <footer className="flex items-center justify-between py-6 text-xs text-white/28">
          <span>{gabrielProfile.name}</span>
          <a className="transition hover:text-sky-300" href={gabrielProfile.website}>
            elevatesystems.us
          </a>
        </footer>
      </div>

      {connectOpen ? (
        <div
          className="gabe-sheet-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-md sm:items-center sm:p-6"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setConnectOpen(false);
          }}
        >
          <section
            aria-labelledby="connect-title"
            aria-modal="true"
            className="gabe-sheet w-full max-w-md border border-white/10 bg-[#07101d] p-5 shadow-2xl sm:p-6"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">Connect</p>
                <h2 className="mt-2 text-2xl font-semibold text-white" id="connect-title">
                  Choose what works best.
                </h2>
              </div>
              <button
                aria-label="Close connect menu"
                className="grid h-10 w-10 place-items-center border border-white/10 text-white/50 hover:bg-white/[0.06] hover:text-white"
                onClick={() => setConnectOpen(false)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">
              <ConnectAction href={gabrielProfile.contactCardHref} icon={Download} label="Save Contact" />
              <ConnectAction href={gabrielProfile.socialLinks[0].href} icon={Linkedin} label="LinkedIn" external />
              <ConnectAction href={gabrielProfile.socialLinks[1].href} icon={XIcon} label="X" external />
              <ConnectAction href={`mailto:${gabrielProfile.publicEmail}`} icon={Mail} label="Email" />
              <ConnectAction href={`sms:${gabrielProfile.phoneHref}`} icon={MessageCircle} label="Text" />
              <ConnectAction href={gabrielProfile.bookingHref} icon={CalendarDays} label="Book a Meeting" />
            </div>

            <button
              className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 border border-sky-300/20 bg-sky-300/[0.08] text-sm font-semibold text-sky-100 hover:bg-sky-300/[0.13]"
              onClick={shareCard}
              type="button"
            >
              {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              {copied ? "Link copied" : "Share My Card"}
            </button>
          </section>
        </div>
      ) : null}
    </main>
  );
}

function ConnectAction({
  external = false,
  href,
  icon: Icon,
  label
}: {
  external?: boolean;
  href: string;
  icon: typeof Download;
  label: string;
}) {
  const content = (
    <>
      <Icon className="h-5 w-5 text-sky-300" />
      <span className="text-sm font-medium text-white/72">{label}</span>
      {external ? <ExternalLink className="ml-auto h-3.5 w-3.5 text-white/25" /> : null}
    </>
  );

  const className =
    "flex min-h-[4.5rem] items-center gap-3 border border-white/10 bg-white/[0.03] px-4 text-left hover:border-sky-300/25 hover:bg-white/[0.06]";

  if (href.startsWith("/")) {
    return (
      <Link className={className} href={href}>
        {content}
      </Link>
    );
  }

  return (
    <a className={className} href={href} rel={external ? "noreferrer" : undefined} target={external ? "_blank" : undefined}>
      {content}
    </a>
  );
}
