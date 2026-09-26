import React from 'react'
import {
  Users,
  Building2,
  Landmark,
  CheckCircle2,
  ArrowRight,
  ArrowDown,
  Radio,
  Database,
  Cpu,
  Clock,
  Sparkles,
  CalendarCheck,
  ShieldCheck,
  TrendingDown,
  FileCheck2,
  LineChart,
} from 'lucide-react'

export default function WhyQueueWise({ onGetStarted, onNavigate, isStandalone = false }) {
  const flowSteps = [
    {
      num: '01',
      title: 'COMMUNITY REPORTS',
      badge: 'Ground Truth',
      icon: Radio,
      desc: 'Citizens report live queue sizes, counter delays & crowd conditions on-site.',
    },
    {
      num: '02',
      title: 'QUEUE DATA',
      badge: 'Aggregation',
      icon: Database,
      desc: 'Centralized telemetry records sensor footfall and historical service duration.',
    },
    {
      num: '03',
      title: 'PREDICTION',
      badge: 'ML / Heuristic',
      icon: Cpu,
      desc: 'Deterministic engine models day-of-week, hour-of-day & counter throughput.',
    },
    {
      num: '04',
      title: 'BEST TIME',
      badge: 'Optimization',
      icon: Clock,
      desc: 'Algorithmic calculation recommends the lowest-crowd arrival window.',
    },
    {
      num: '05',
      title: 'BETTER VISIT',
      badge: 'Dignified Service',
      icon: CheckCircle2,
      desc: 'Minimal waiting, 100% prepared documents, and predictable civic outcomes.',
    },
  ]

  const stakeholders = [
    {
      id: 'citizens',
      title: 'CITIZENS',
      subtitle: 'Public & Families',
      icon: Users,
      color: 'blue',
      badgeClass: 'bg-blue-100 text-blue-900 border-blue-200',
      iconBg: 'bg-blue-900 text-white',
      tagline: 'Transforming stressful bureaucratic delays into predictable, dignified civic visits.',
      points: [
        {
          name: 'Less waiting',
          desc: 'Avoid peak congestion hours with real-time queue forecasts and proactive drop alerts.',
        },
        {
          name: 'Fewer repeat visits',
          desc: 'Complete civic procedures in a single trip with comprehensive preparation tools.',
        },
        {
          name: 'Better document preparation',
          desc: 'Interactive document checklists with exact original and photocopy requirements.',
        },
        {
          name: 'Better planning',
          desc: 'Schedule visits around work and family routines with calibrated arrival time slots.',
        },
      ],
    },
    {
      id: 'offices',
      title: 'GOVERNMENT OFFICES',
      subtitle: 'Service Counters & Staff',
      icon: Building2,
      color: 'emerald',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      iconBg: 'bg-emerald-800 text-white',
      tagline: 'Balancing citizen footfall evenly across operating hours to prevent counter burnout.',
      points: [
        {
          name: 'Queue visibility',
          desc: 'Real-time counter load tracking and transparent public queue indicators.',
        },
        {
          name: 'Crowd management',
          desc: 'Nudge citizen arrivals toward low-occupancy windows to smooth out morning rushes.',
        },
        {
          name: 'Resource planning',
          desc: 'Dynamic counter staging and token allocation tailored to hourly demand spikes.',
        },
        {
          name: 'Citizen experience insights',
          desc: 'Continuous community feedback loops to pinpoint operational bottlenecks.',
        },
      ],
    },
    {
      id: 'admin',
      title: 'DISTRICT ADMINISTRATION',
      subtitle: 'Magistrates & Policy Makers',
      icon: Landmark,
      color: 'slate',
      badgeClass: 'bg-slate-200 text-slate-900 border-slate-300',
      iconBg: 'bg-slate-900 text-white',
      tagline: 'Evidence-based civic governance with cross-departmental throughput intelligence.',
      points: [
        {
          name: 'Cross-office analytics',
          desc: 'Unified district dashboard comparing RTO, DM, Municipal, Tehsil, and Passport hubs.',
        },
        {
          name: 'Service demand patterns',
          desc: 'Analyze seasonal, weekly, and hourly citizen demand trends across all departments.',
        },
        {
          name: 'Operational alerts',
          desc: 'Automated surge notifications when line lengths or wait times breach SLA thresholds.',
        },
        {
          name: 'Data-driven planning',
          desc: 'Allocate budget, personnel, and infrastructure investments backed by empirical data.',
        },
      ],
    },
  ]

  return (
    <section id="why-queuewise" className={`${isStandalone ? 'py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' : 'pt-16 pb-6'}`}>
      
      {/* â”€â”€ SECTION HEADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 rounded-md bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-900 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-blue-700" />
          Product Architecture & Value Model
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Why QueueWise?
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[#1D2939]">
          A modern civic-tech platform designed to eliminate waiting anxiety for citizens while giving public administrators the tools to operate dignified, crowd-resilient service centers.
        </p>
      </div>

      {/* â”€â”€ PRODUCT MISSION STATEMENT BANNER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="card p-6 sm:p-8 bg-white border border-[#CBD5E1] shadow-xs mb-12 relative overflow-hidden">
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0757A6] block mb-2">
            CORE VALUE PROPOSITION
          </span>
          <blockquote className="text-xl sm:text-2xl lg:text-[26px] font-black tracking-tight text-[#0F172A] leading-snug">
            â€œQueueWise turns unpredictable government visits into planned visits.â€
          </blockquote>
          <p className="mt-3 text-xs sm:text-sm text-[#475467] max-w-2xl mx-auto leading-relaxed">
            By turning raw crowdsourced field updates into actionable queue predictions and verified document readiness checklists, public offices shift from chaotic first-come bottlenecks to smooth, predictable appointments.
          </p>
        </div>
      </div>

      {/* â”€â”€ VISUAL FLOW PIPELINE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="card p-6 sm:p-7 bg-white border-slate-200 mb-12 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
          <div>
            <span className="journey-step-tag">End-to-End Pipeline</span>
            <h3 className="text-base font-bold text-slate-900 mt-1">How QueueWise Transforms Civic Data into Calm Visits</h3>
          </div>
          <span className="text-xs font-medium text-[#344054]">
            Field Telemetry â†’ Algorithmic Certainty
          </span>
        </div>

        {/* Responsive Flow: Horizontal on md+, Vertical with down arrows on mobile */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
            {flowSteps.map((step, idx) => {
              const Icon = step.icon
              const isLast = idx === flowSteps.length - 1

              return (
                <div key={step.num} className="relative flex flex-col">
                  {/* Step Card */}
                  <div className="h-full p-4 rounded-xl border border-slate-200/90 bg-[#E8F0F8]/60 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="text-[10px] font-mono font-bold text-[#475467]">
                          {step.num}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                          {step.badge}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-lg bg-blue-900 text-white shrink-0 group-hover:scale-105 transition-transform">
                          <Icon className="h-4 w-4" />
                        </div>
                        <h4 className="text-xs font-black text-slate-900 tracking-tight leading-tight">
                          {step.title}
                        </h4>
                      </div>

                      <p className="text-[11px] text-[#1D2939] leading-snug mt-1.5">
                        {step.desc}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-[#475467]">
                      <span>Phase {idx + 1}</span>
                      <span className="font-semibold text-emerald-700">âœ“ Verified</span>
                    </div>
                  </div>

                  {/* Desktop Right Connector Arrow */}
                  {!isLast && (
                    <div className="hidden md:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-[#475467] bg-white rounded-full p-0.5 border border-slate-200 shadow-2xs">
                      <ArrowRight className="h-3 w-3 text-[#344054]" />
                    </div>
                  )}

                  {/* Mobile Down Connector Arrow */}
                  {!isLast && (
                    <div className="md:hidden flex justify-center py-1 text-blue-900">
                      <ArrowDown className="h-4 w-4 text-blue-800 animate-bounce" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* â”€â”€ THREE STAKEHOLDERS SECTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <span className="journey-step-tag">Stakeholder Impact</span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">Value for Every Civic Participant</h3>
          </div>
          <p className="text-xs text-[#344054] max-w-md">
            Solving the public service dilemma requires creating simultaneous value for citizens arriving at the desk, counter officers handling cases, and district executives overseeing regional governance.
          </p>
        </div>

        {/* 3 Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {stakeholders.map((sh) => {
            const Icon = sh.icon
            return (
              <div
                key={sh.id}
                className="card p-6 border-slate-200/90 flex flex-col justify-between hover:border-slate-300 transition-all hover:shadow-xs"
              >
                <div>
                  {/* Stakeholder Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${sh.iconBg} shadow-xs`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                          {sh.title}
                        </h4>
                        <span className="text-[11px] font-semibold text-[#344054]">
                          {sh.subtitle}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#1D2939] mb-5 pb-3 border-b border-slate-100 leading-relaxed font-medium">
                    {sh.tagline}
                  </p>

                  {/* 4 Required Value Points */}
                  <div className="space-y-3.5">
                    {sh.points.map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-2.5">
                        <div className="mt-0.5 p-0.5 rounded-full bg-emerald-50 text-emerald-700 shrink-0">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                        <div className="text-xs">
                          <strong className="font-bold text-slate-900 block leading-tight">
                            {pt.name}
                          </strong>
                          <span className="text-[#344054] text-[11px] leading-snug mt-0.5 block">
                            {pt.desc}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer contextual stat/badge */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#344054]">
                  <span className="font-semibold text-slate-700">4 Core Advantages</span>
                  <span className="text-emerald-700 font-bold">100% Civic Grounded</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* â”€â”€ ACTION BANNER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <h4 className="text-base font-bold tracking-tight text-white">
            Ready to experience predictable public service?
          </h4>
          <p className="text-xs text-slate-300 mt-1">
            Choose an office to plan your next visit, or inspect district-level queue telemetry in real-time.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {onGetStarted && (
            <button
              type="button"
              onClick={() => onGetStarted(null, null)}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-xs transition-colors flex items-center gap-1.5 focus-ring"
            >
              <span>Plan My Visit</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('analytics')}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 focus-ring"
            >
              <span>District Operations Monitor</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

    </section>
  )
}


