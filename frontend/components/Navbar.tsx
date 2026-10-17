"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Menu, X, ArrowRight } from "lucide-react";

interface NavbarProps {
  userEmail?: string | null;
  onLogout?: () => Promise<void>;
}

export default function Navbar({ userEmail, onLogout }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Capabilities", href: "#capabilities" },
    { name: "Intelligence", href: "#intelligence" },
    { name: "Privacy", href: "#privacy" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-navy/95 backdrop-blur-sm text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm shadow-sky-600/30 transition-transform duration-200 ease-out group-hover:scale-105">
              <ShieldCheck className="h-5 w-5 transition-transform duration-200 group-hover:rotate-3" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-sky-300 transition-colors">
              FinOS
            </span>
          </Link>

          {/* Desktop Public Anchors */}
          {!userEmail && (
            <nav className="hidden md:flex items-center space-x-6 text-xs font-medium text-slate-300">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="relative py-1 hover:text-white transition-colors duration-150 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-sky-400 after:transition-all after:duration-200"
                >
                  {link.name}
                </a>
              ))}
            </nav>
          )}
        </div>

        {/* Right side navigation */}
        <div className="hidden sm:flex items-center space-x-3">
          {userEmail ? (
            <div className="flex items-center space-x-4">
              <span className="text-xs text-slate-300 font-medium truncate max-w-[200px]">
                {userEmail}
              </span>
              <Link
                href="/dashboard"
                className="rounded-lg bg-sky-500/15 border border-sky-400/30 px-3.5 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/25 transition-all duration-150"
              >
                Dashboard
              </Link>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="rounded-lg bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-150 active:scale-95"
                >
                  Sign Out
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800/60 transition-all duration-150"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="group inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-sky-600/25 hover:bg-sky-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200"
              >
                Get Started
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex sm:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 active:scale-95 transition-all duration-150"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-slate-800 bg-navy px-4 pt-3 pb-5 space-y-3 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          {!userEmail && (
            <div className="space-y-1 pb-3 border-b border-slate-800">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
          )}

          {userEmail ? (
            <div className="space-y-2 pt-1">
              <p className="text-xs text-slate-400 truncate">{userEmail}</p>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center rounded-xl bg-sky-600 py-2.5 text-xs font-semibold text-white shadow-sm"
              >
                Go to Dashboard
              </Link>
              {onLogout && (
                <button
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await onLogout();
                  }}
                  className="w-full text-center rounded-xl border border-slate-800 bg-slate-900 py-2 text-xs font-medium text-slate-300"
                >
                  Sign Out
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-xl border border-slate-800 bg-slate-900/60 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-xl bg-sky-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
