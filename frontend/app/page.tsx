import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductPreview from "@/components/ProductPreview";
import {
  ArrowRight,
  TrendingUp,
  Wallet,
  ShieldCheck,
  FileSpreadsheet,
  Target,
  Lock,
  Percent,
  CheckCircle2,
  BarChart3,
  Layers,
  SlidersHorizontal,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 selection:bg-sky-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* =========================================================
            1. HERO SECTION (Deep Navy Shell)
        ========================================================= */}
        <section className="relative overflow-hidden bg-navy pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-800 text-white">
          {/* Ambient Lighting Gradients */}
          <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-sky-600/15 blur-3xl" />
          <div className="pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-indigo-600/15 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold text-sky-300 shadow-sm animate-fade-in transition-all duration-200 hover:border-sky-400/50">
                <Wallet className="h-3.5 w-3.5 text-sky-400" />
                PERSONAL FINANCE PLATFORM
              </div>

              {/* Main headline */}
              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl animate-fade-in-up">
                Your finances,{" "}
                <span className="text-sky-400">understood.</span>
              </h1>

              {/* Supporting copy */}
              <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-300 max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
                FinOS brings your income, expenses, budgets, and savings goals into
                one clear, private view with intelligent financial insights.
              </p>

              {/* Action buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in-up animation-delay-200">
                <Link
                  href="/login"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm shadow-sky-600/25 hover:bg-sky-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-800 hover:text-white hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200"
                >
                  Sign In to FinOS
                </Link>
              </div>

              {/* Sub-hero trust bullets (Consumer-focused outcomes) */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400 font-medium animate-fade-in-up animation-delay-300">
                <span className="inline-flex items-center gap-1.5 transition-colors duration-150 hover:text-slate-200 cursor-default">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Clear cash flow tracking
                </span>
                <span className="inline-flex items-center gap-1.5 transition-colors duration-150 hover:text-slate-200 cursor-default">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Easy statement import
                </span>
                <span className="inline-flex items-center gap-1.5 transition-colors duration-150 hover:text-slate-200 cursor-default">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Private financial workspace
                </span>
              </div>
            </div>

            {/* =========================================================
                2. PRODUCT PREVIEW CENTERPIECE (Interactive Live Showcase)
            ========================================================= */}
            <div className="mt-12 sm:mt-16 mx-auto max-w-5xl animate-fade-in-up animation-delay-300">
              <ProductPreview />
            </div>
          </div>
        </section>

        {/* =========================================================
            3. CORE PRODUCT CAPABILITIES SECTION (Crisp Light Surface)
        ========================================================= */}
        <section id="capabilities" className="py-16 sm:py-24 bg-white border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 mb-3">
                <Layers className="h-3.5 w-3.5 text-sky-600" />
                ENGINEERED FOR ACCURACY
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Core Financial Capabilities
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600">
                A complete financial operating system built around verifiable accounting, flexible planning, and intelligent insights.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Capability 1 */}
              <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-sky-300 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-200 flex flex-col justify-between cursor-default">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-5 border border-emerald-100 transition-transform duration-200 ease-out group-hover:scale-110">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-sky-950 transition-colors">
                    Cash Flow Tracking
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    See where your money comes from, where it goes, and how your cash flow changes over time with real-time balance calculations.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] font-semibold text-emerald-700">
                  Accurate &bull; Real-time Calculations
                </div>
              </div>

              {/* Capability 2 */}
              <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-sky-300 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-200 flex flex-col justify-between cursor-default">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600 mb-5 border border-sky-100 transition-transform duration-200 ease-out group-hover:scale-110">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-sky-950 transition-colors">
                    Statement Import
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Bring your existing transactions into FinOS through a simple statement upload, automated duplicate detection, and review workflow.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] font-semibold text-sky-700">
                  CSV &amp; PDF Supported
                </div>
              </div>

              {/* Capability 3 */}
              <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-sky-300 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-200 flex flex-col justify-between cursor-default">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 mb-5 border border-amber-100 transition-transform duration-200 ease-out group-hover:scale-110">
                    <Target className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-sky-950 transition-colors">
                    Budgets &amp; Goals
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Set monthly category spending limits, track utilization progress, and manage personal savings goals toward milestones.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] font-semibold text-amber-700">
                  Threshold Alerts &bull; Targets
                </div>
              </div>

              {/* Capability 4 */}
              <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-sky-300 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-200 flex flex-col justify-between cursor-default">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-5 border border-emerald-100 transition-transform duration-200 ease-out group-hover:scale-110">
                    <Target className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-sky-950 transition-colors">
                    Milestone Savings Goals
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Set milestone targets, monitor real-time savings contributions, and measure progress toward your goals.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] font-semibold text-emerald-700">
                  Real-time Tracking &bull; Goal Progress
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            4. FINANCIAL INTELLIGENCE SHOWCASE (Light Slate Surface)
        ========================================================= */}
        <section id="intelligence" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 mb-3 shadow-sm">
                <BarChart3 className="h-3.5 w-3.5 text-sky-600" />
                CLARITY FROM DATA
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Financial Intelligence That Makes Sense
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600">
                FinOS organizes raw transaction entries into structured patterns, category breakdowns, and actionable financial indicators.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Showcase 1 */}
              <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-sky-300 hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-default">
                <div>
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-sky-50 text-sky-600 mb-4 transition-transform duration-200 ease-out group-hover:scale-110">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Cash Flow Patterns
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Understand your net surplus or deficit over 3, 6, and 12-month intervals. Spot seasonal spikes before they strain your budget.
                  </p>
                </div>
                <div className="mt-4 rounded-lg bg-slate-50 p-3 border border-slate-100 text-xs transition-colors group-hover:bg-slate-100/70">
                  <span className="text-slate-500 block text-[10px]">Net Cash Flow Calculation</span>
                  <span className="font-mono font-bold text-emerald-600">Total Income - Total Expenses</span>
                </div>
              </div>

              {/* Showcase 2 */}
              <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-sky-300 hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-default">
                <div>
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-amber-50 text-amber-600 mb-4 transition-transform duration-200 ease-out group-hover:scale-110">
                    <SlidersHorizontal className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Budget Discipline
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Active tracking alerts you when categories reach 85% utilization or exceed limits, helping you maintain financial control.
                  </p>
                </div>
                <div className="mt-4 rounded-lg bg-slate-50 p-3 border border-slate-100 text-xs transition-colors group-hover:bg-slate-100/70">
                  <span className="text-slate-500 block text-[10px]">Health Thresholds</span>
                  <span className="font-semibold text-slate-700">On Track &bull; Near Limit &bull; Exceeded</span>
                </div>
              </div>

              {/* Showcase 3 */}
              <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-sky-300 hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-default">
                <div>
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-4 transition-transform duration-200 ease-out group-hover:scale-110">
                    <Percent className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Savings Efficiency
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Calculate what percentage of your earned income is successfully retained each month to fund your long-term goals.
                  </p>
                </div>
                <div className="mt-4 rounded-lg bg-slate-50 p-3 border border-slate-100 text-xs transition-colors group-hover:bg-slate-100/70">
                  <span className="text-slate-500 block text-[10px]">Monthly Savings Rate</span>
                  <span className="font-mono font-bold text-sky-700">(Net Cash Flow / Income) &times; 100</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            5. PRIVACY & TRUST SECTION (Light Slate Surface)
        ========================================================= */}
        <section id="privacy" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 mb-4 shadow-sm border border-sky-100">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Your financial records stay private and isolated to your account.
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
              FinOS ensures that only you have access to your transactions, budgets, goals, and statements. No cross-account data sharing, no third-party data monetization.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-sky-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                <ShieldCheck className="h-5 w-5 text-sky-600 mb-2" />
                <h4 className="text-xs font-bold text-slate-900">Account Isolation</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  All financial records strictly bound to your authenticated account.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-sky-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                <Lock className="h-5 w-5 text-sky-600 mb-2" />
                <h4 className="text-xs font-bold text-slate-900">Secure Sessions</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Session authentication tokens with client-side encrypted transmission.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-sky-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 mb-2" />
                <h4 className="text-xs font-bold text-slate-900">Accurate Insights</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Insights grounded strictly in your recorded numbers, never speculative ads.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            7. FINAL CALL TO ACTION (Deep Navy Shell)
        ========================================================= */}
        <section className="relative overflow-hidden bg-navy py-16 sm:py-20 border-b border-slate-800 text-white">
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-sky-600/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl" />

          <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Bring your finances into focus.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
              Track your spending, plan your goals, and understand your financial patterns with FinOS.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signup"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm shadow-sky-600/25 hover:bg-sky-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-800 hover:text-white hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200"
              >
                Sign In to Account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
