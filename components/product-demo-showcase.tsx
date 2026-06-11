"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  ChevronDown,
  Construction,
  Globe2,
  PhoneCall,
  ScanSearch,
  Sparkles,
  Target,
  X
} from "lucide-react";
import { useState } from "react";

const products = [
  {
    name: "Elevate Orders",
    description: "AI-powered restaurant ordering, guest assistance, and live kitchen operations.",
    icon: Sparkles,
    status: "Live demo",
    href: "/elevateorders"
  },
  {
    name: "Elevate Receptionist",
    description: "An AI front desk for calls, questions, qualification, and booking.",
    icon: PhoneCall,
    status: "Coming soon"
  },
  {
    name: "Elevate Leads",
    description: "Capture, qualify, route, and follow up with every new opportunity.",
    icon: Target,
    status: "Coming soon"
  },
  {
    name: "Elevate Audit",
    description: "Fast website intelligence and clear recommendations for business owners.",
    icon: ScanSearch,
    status: "Coming soon"
  },
  {
    name: "Elevate Websites",
    description: "High-trust business websites built to convert and connect to operations.",
    icon: Globe2,
    status: "Coming soon"
  }
];

export function ProductDemoShowcase() {
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  const [chooserOpen, setChooserOpen] = useState(false);

  const chooseProduct = (product: (typeof products)[number]) => {
    setChooserOpen(false);
    if (product.href) {
      window.location.href = product.href;
      return;
    }
    setComingSoon(product.name);
  };

  return (
    <>
      <div className="demo-chooser">
        <button
          aria-expanded={chooserOpen}
          className="demo-chooser-trigger"
          onClick={() => setChooserOpen((value) => !value)}
          type="button"
        >
          <span>
            <small>Choose a product</small>
            <b>Browse all Elevate demos</b>
          </span>
          <ChevronDown className={`h-5 w-5 transition ${chooserOpen ? "rotate-180" : ""}`} />
        </button>
        <div className={`demo-chooser-menu ${chooserOpen ? "is-open" : ""}`}>
          {products.map((product) => (
            <button key={product.name} onClick={() => chooseProduct(product)} type="button">
              <span className="product-icon"><product.icon className="h-4 w-4" /></span>
              <span><b>{product.name}</b><small>{product.status}</small></span>
              {product.href ? <ArrowUpRight className="h-4 w-4 text-sky-300" /> : <Sparkles className="h-4 w-4 text-white/25" />}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product, index) => {
          const content = (
            <>
              <span className="product-icon">
                <product.icon className="h-5 w-5" />
              </span>
              <span className={`product-status ${product.href ? "is-live" : ""}`}>
                {product.href && <span className="live-dot" />}
                {product.status}
              </span>
              <h3 className="mt-8 text-lg font-semibold text-white">{product.name}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-white/45">{product.description}</p>
              <span className="mt-7 flex items-center gap-2 text-xs font-semibold text-sky-300">
                {product.href ? "Open interactive demo" : "Preview coming soon"}
                {product.href ? <ArrowUpRight className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              </span>
            </>
          );

          return product.href ? (
            <Link
              className={`product-demo-card group ${index === 0 ? "lg:col-span-2" : ""}`}
              href={product.href}
              key={product.name}
              style={{ animationDelay: `${index * 70}ms` }}
            >
              {content}
            </Link>
          ) : (
            <button
              className="product-demo-card group text-left"
              key={product.name}
              onClick={() => setComingSoon(product.name)}
              style={{ animationDelay: `${index * 70}ms` }}
              type="button"
            >
              {content}
            </button>
          );
        })}
      </div>

      {comingSoon && (
        <div className="coming-soon-backdrop" onMouseDown={() => setComingSoon(null)}>
          <div className="coming-soon-dialog" onMouseDown={(event) => event.stopPropagation()}>
            <button
              aria-label="Close coming soon dialog"
              className="coming-soon-close"
              onClick={() => setComingSoon(null)}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="construction-orbit">
              <span />
              <Construction className="h-8 w-8" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">In development</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">{comingSoon}</h2>
            <p className="mx-auto mt-4 max-w-md leading-7 text-white/50">
              This product is being shaped into the next interactive Elevate demo. The experience is
              coming soon.
            </p>
            <div className="coming-soon-progress">
              <span />
            </div>
            <button className="coming-soon-button" onClick={() => setComingSoon(null)} type="button">
              Got it
              <Bot className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
