import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  ExternalLink,
  Inbox,
  LogOut,
  Settings,
  Sparkles
} from "lucide-react";

const navigation = [
  { label: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
  { label: "Leads", href: "/admin/leads", icon: Sparkles },
  { label: "Inquiries", href: "/admin/inquiries", icon: Inbox },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarDays },
  { label: "Settings", href: "/admin/settings", icon: Settings }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050914] text-white">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/10 bg-[#070c18] lg:flex lg:flex-col">
        <div className="border-b border-white/10 px-6 py-6">
          <p className="text-sm font-semibold tracking-[0.2em]">ELEVATE</p>
          <p className="mt-1 text-xs tracking-[0.28em] text-sky-300">COMMAND CENTER</p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navigation.map((item) => (
            <Link
              className="flex items-center gap-3 rounded-md px-3 py-3 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
              href={item.href}
              key={item.href}
            >
              <item.icon className="h-4 w-4 text-sky-300" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-2 border-t border-white/10 p-3">
          <Link
            className="flex items-center gap-3 rounded-md px-3 py-3 text-sm text-white/55 hover:bg-white/10 hover:text-white"
            href="/"
          >
            <ExternalLink className="h-4 w-4" />
            View website
          </Link>
          <form action="/api/admin/logout" method="post">
            <button className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm text-white/55 hover:bg-white/10 hover:text-white">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#050914]/90 px-5 py-4 backdrop-blur-xl lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
                Elevate Systems
              </p>
              <p className="mt-1 hidden text-sm text-white/45 sm:block">Lead operations</p>
            </div>
            <nav className="flex max-w-full gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden">
              {navigation.slice(0, 4).map((item) => (
                <Link
                  className="rounded-md px-3 py-2 text-xs text-white/60 hover:bg-white/10"
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
