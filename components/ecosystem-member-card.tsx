import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";

import type { EcosystemMember } from "@/lib/ecosystem-data";

type EcosystemMemberCardProps = {
  member: EcosystemMember;
  index: number;
};

export function EcosystemMemberCard({ member, index }: EcosystemMemberCardProps) {
  const isTechnologyPartner = member.relationship === "technology";

  return (
    <article
      className="group relative overflow-hidden border border-white/10 bg-[#07101d]/80 transition duration-500 hover:-translate-y-1 hover:border-sky-300/30 hover:shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(56,189,248,0.12),transparent_38%)] opacity-0 transition duration-500 group-hover:opacity-100" />

      <div className={`relative grid ${isTechnologyPartner ? "lg:grid-cols-[0.9fr_1.1fr]" : "lg:grid-cols-[1.08fr_0.92fr]"}`}>
        <div
          className={`relative min-h-[280px] overflow-hidden border-white/10 ${
            isTechnologyPartner
              ? "flex items-center justify-center border-b bg-[#101010] p-12 lg:border-b-0 lg:border-r"
              : "border-b bg-[#f4eee3] lg:border-b-0 lg:border-r"
          }`}
        >
          {member.preview ? (
            <>
              <Image
                alt={member.preview.desktopAlt}
                className="h-full min-h-[300px] w-full object-cover object-left-top transition duration-700 group-hover:scale-[1.025]"
                height={900}
                src={member.preview.desktopSrc}
                width={1440}
              />
              <div className="absolute bottom-5 right-5 w-[27%] max-w-[150px] overflow-hidden border-4 border-[#07101d] bg-[#f4eee3] shadow-2xl sm:bottom-7 sm:right-7">
                <Image
                  alt={member.preview.mobileAlt}
                  className="h-auto w-full"
                  height={770}
                  src={member.preview.mobileSrc}
                  width={378}
                />
              </div>
            </>
          ) : (
            <div className="relative flex h-44 w-44 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] shadow-[0_0_80px_rgba(56,189,248,0.08)] transition duration-500 group-hover:scale-105 group-hover:border-sky-300/25">
              <Image
                alt={`${member.name} logo`}
                className="h-28 w-28 object-contain"
                height={112}
                src={member.logoSrc}
                width={112}
              />
              <span className="absolute -inset-7 rounded-full border border-dashed border-white/10 transition duration-700 group-hover:rotate-45" />
            </div>
          )}
        </div>

        <div className="relative flex flex-col justify-center p-7 sm:p-10 lg:p-12">
          <div className="flex items-start justify-between gap-6">
            <div>
              <span className="inline-flex border border-sky-300/25 bg-sky-300/[0.07] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300">
                {member.badge}
              </span>
              <h3 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">{member.name}</h3>
            </div>
            {member.preview ? (
              <Image
                alt={`${member.name} logo`}
                className="h-16 w-16 shrink-0 rounded-full object-cover ring-1 ring-white/15"
                height={64}
                src={member.logoSrc}
                width={64}
              />
            ) : null}
          </div>

          <p className="mt-5 max-w-xl text-base leading-8 text-white/60 sm:text-lg">{member.description}</p>

          <ul className="mt-7 grid gap-3 text-sm text-white/70 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {member.highlights.map((highlight) => (
              <li className="flex items-center gap-2" key={highlight}>
                <Check className="h-4 w-4 shrink-0 text-emerald-300" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>

          <Link
            className="animated-link mt-9 inline-flex w-fit items-center gap-2 font-semibold text-sky-300"
            href={member.href}
            rel="noreferrer"
            target="_blank"
          >
            {member.linkLabel}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
