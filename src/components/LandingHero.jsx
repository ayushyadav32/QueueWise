import { useState, useMemo } from 'react'
import { offices, services, popularServices, getQueueStatus } from '../data/mockData'
import { calculateQueuePrediction } from '../utils/predictionEngine'
import {
  ArrowRight,
  Clock,
  Users,
  CheckCircle2,
  Calendar,
  Building2,
  FileCheck,
  Sparkles,
} from 'lucide-react'

const STATUS_CONFIG = {
  low:      { badge: 'badge badge-low',      label: 'Low',      color: 'text-emerald-700' },
  moderate: { badge: 'badge badge-moderate', label: 'Moderate', color: 'text-amber-800' },
  high:     { badge: 'badge badge-high',     label: 'High',     color: 'text-red-700' },
  critical: { badge: 'badge badge-critical', label: 'Critical', color: 'text-red-800' },
}

export default function LandingHero({ onGetStarted, onNavigate, currentUser }) {
  // Live queue prediction snapshots for each monitored office
  const liveMap = useMemo(() => {
    return Object.fromEntries(
      offices.map(o => {
        const pred = calculateQueuePrediction({ officeId: o.id, date: new Date() })
        return [
          o.id,
          {
            count: pred.count,
            wait: pred.wait,
            status: pred.status,
            updated: '4 mins ago',
          },
        ]
      })
    )
  }, [])

  // Computed popular services with current queue estimates
  const computedPopularServices = useMemo(() => {
    return popularServices.slice(0, 5).map(item => {
      const pred = calculateQueuePrediction({ officeId: item.officeId, serviceId: item.serviceId, date: new Date() })
      return {
        ...item,
        currentQueue: pred.count,
        avgWait: pred.wait,
        status: pred.status.level,
      }
    })
  }, [])

  const handlePopularSelect = (item) => {
    const office = offices.find(o => o.id === item.officeId)
    const officeServices = services[item.officeId] || []
    const service = officeServices.find(s => s.id === item.serviceId)
    onGetStarted(office || null, service || null)
  }

  const scrollToServices = () => {
    const el = document.getElementById('popular-services-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="space-y-12 pb-16">

      {/* â”€â”€ 1. HERO / PLANNING SECTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="bg-white border-b border-[#CBD5E1] py-14 lg:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-center">

            {/* Left Headline & 2 CTAs */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#EFF6FC] border border-[#D0E4F7] px-3.5 py-1 text-xs font-semibold text-[#0757A6]">
                <span className="h-2 w-2 rounded-full bg-[#0757A6]" />
                Lucknow District Citizen Queue Portal
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#0F172A] tracking-tight leading-tight">
                Plan your government visit before you leave home.
              </h1>

              <p className="text-base text-[#475467] leading-relaxed max-w-xl">
                Check queues, prepare documents, and find a better time to visit.
              </p>

              {/* Exactly Two Clean CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onGetStarted(null, null)}
                  className="btn-primary py-2.5 px-6 text-sm font-bold shadow-sm"
                >
                  <span>Plan My Visit</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={scrollToServices}
                  className="btn-secondary py-2.5 px-5 text-sm font-semibold"
                >
                  Explore Services
                </button>
              </div>

              <div className="pt-4 flex items-center gap-6 text-xs text-[#475467]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#087F75]" />
                  5 Monitored District Offices
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#087F75]" />
                  Verified Document Checklists
                </span>
              </div>
            </div>

            {/* Right: Clean 3-Step Summary Card */}
            <div className="lg:col-span-5">
              <div className="card p-6 border border-[#CBD5E1] bg-[#EEF3F8]/50">
                <div className="flex items-center justify-between pb-3 border-b border-[#CBD5E1] mb-4">
                  <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                    How You Save Time
                  </span>
                  <span className="text-[11px] font-semibold text-[#087F75]">
                    Avg ~45 min saved
                  </span>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-[#CBD5E1]">
                    <div className="h-6 w-6 rounded bg-[#EFF6FC] text-[#0757A6] font-bold text-xs flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#0F172A]">Select Office & Procedure</h3>
                      <p className="text-[11px] text-[#475467] mt-0.5">Choose your destination and service.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-[#CBD5E1]">
                    <div className="h-6 w-6 rounded bg-[#EFF6FC] text-[#0757A6] font-bold text-xs flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#0F172A]">Inspect Queue & Documents</h3>
                      <p className="text-[11px] text-[#475467] mt-0.5">Verify required paperwork before leaving.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-[#CBD5E1]">
                    <div className="h-6 w-6 rounded bg-[#EFF6FC] text-[#0757A6] font-bold text-xs flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#0F172A]">Visit at Low-Crowd Hours</h3>
                      <p className="text-[11px] text-[#475467] mt-0.5">Avoid peak delays with recommended arrival slots.</p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onGetStarted(null, null)}
                  className="mt-4 w-full btn-primary py-2 text-xs font-bold justify-center"
                >
                  Start Planning Now
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* â”€â”€ 2. POPULAR GOVERNMENT SERVICES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section id="popular-services-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs font-bold text-[#475467] uppercase tracking-wider">
              Popular Government Services
            </h2>
            <p className="text-base font-bold text-[#0F172A] mt-0.5">
              Frequently requested citizen procedures
            </p>
          </div>
          <button
            type="button"
            onClick={() => onGetStarted(null, null)}
            className="text-xs font-semibold text-[#0757A6] hover:underline hidden sm:inline"
          >
            View all services â†’
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {computedPopularServices.map((item) => {
            const st = STATUS_CONFIG[item.status] || STATUS_CONFIG.moderate
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePopularSelect(item)}
                className="card p-4 text-left transition-colors hover:border-[#0757A6] group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-lg p-1.5 rounded bg-[#EEF3F8] border border-[#CBD5E1]">
                      {item.icon}
                    </span>
                    <span className={st.badge}>{st.label}</span>
                  </div>
                  <h3 className="text-xs font-bold text-[#0F172A] group-hover:text-[#0757A6] transition-colors leading-snug line-clamp-2">
                    {item.serviceName}
                  </h3>
                  <p className="text-[11px] text-[#475467] mt-1 truncate">
                    {item.officeName}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#CBD5E1] flex items-center justify-between text-[11px] text-[#475467]">
                  <span className="flex items-center gap-1 font-medium">
                    <Users className="h-3 w-3 text-[#475467]" />
                    {item.currentQueue} waiting
                  </span>
                  <span className="flex items-center gap-1 font-bold text-[#0F172A]">
                    <Clock className="h-3 w-3 text-[#475467]" />
                    ~{item.avgWait}m
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* â”€â”€ 3. CURRENT QUEUE HIGHLIGHTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs font-bold text-[#475467] uppercase tracking-wider">
              Current Queue Highlights
            </h2>
            <p className="text-base font-bold text-[#0F172A] mt-0.5">
              Live waiting conditions across district offices
            </p>
          </div>
          <span className="text-xs text-[#475467] font-medium hidden sm:inline">
            Updated continuously
          </span>
        </div>

        {/* 5 Compact Office Cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {offices.map((office) => {
            const snap = liveMap[office.id]
            const qs = snap ? getQueueStatus(snap.count) : null
            const st = qs ? STATUS_CONFIG[qs.level] : STATUS_CONFIG.low
            const waitTime = snap ? Math.round((snap.count * 30) / 6) : 0

            return (
              <div
                key={office.id}
                className="card p-4 flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-bold text-[#0F172A] truncate">
                      {office.name}
                    </span>
                    <span className={st.badge}>{st.label}</span>
                  </div>

                  <div className="my-3 p-2.5 bg-[#EEF3F8] rounded border border-[#CBD5E1]">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-extrabold text-[#0F172A] tabular-nums">
                        {snap ? snap.count : 'â€”'}
                      </span>
                      <span className="text-xs font-bold text-[#0757A6] tabular-nums">
                        ~{waitTime} min wait
                      </span>
                    </div>
                    <div className="text-[10px] text-[#475467] mt-0.5">
                      people waiting in line
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[10px] text-[#475467] mb-2.5">
                    <span>{office.timings.split('â€“')[0]} Open</span>
                    <span>{snap?.updated || 'Just now'}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onGetStarted(office, null)}
                    className="w-full btn-secondary py-1.5 text-xs font-bold justify-center"
                  >
                    Plan Visit â†’
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* â”€â”€ 4. HOW QUEUEWISE WORKS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="card p-6 sm:p-8 bg-white border border-[#CBD5E1]">
          <div className="max-w-2xl mb-6">
            <span className="section-label">Citizen Workflow</span>
            <h2 className="text-lg font-bold text-[#0F172A] mt-1">
              How QueueWise Works
            </h2>
            <p className="text-xs text-[#475467] mt-0.5">
              QueueWise turns unpredictable government visits into planned visits.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 bg-[#EEF3F8] rounded-lg border border-[#CBD5E1]">
              <div className="text-xs font-bold text-[#0757A6] mb-1">01</div>
              <h3 className="text-xs font-bold text-[#0F172A]">Select Office & Service</h3>
              <p className="text-[11px] text-[#475467] mt-1 leading-relaxed">
                Choose the district office and exact citizen procedure you need.
              </p>
            </div>

            <div className="p-4 bg-[#EEF3F8] rounded-lg border border-[#CBD5E1]">
              <div className="text-xs font-bold text-[#0757A6] mb-1">02</div>
              <h3 className="text-xs font-bold text-[#0F172A]">Check Live Queue</h3>
              <p className="text-[11px] text-[#475467] mt-1 leading-relaxed">
                View real-time waiting times and crowd levels before leaving home.
              </p>
            </div>

            <div className="p-4 bg-[#EEF3F8] rounded-lg border border-[#CBD5E1]">
              <div className="text-xs font-bold text-[#0757A6] mb-1">03</div>
              <h3 className="text-xs font-bold text-[#0F172A]">Verify Document Checklist</h3>
              <p className="text-[11px] text-[#475467] mt-1 leading-relaxed">
                Ensure all certificates and proofs are ready to prevent repeated trips.
              </p>
            </div>

            <div className="p-4 bg-[#EEF3F8] rounded-lg border border-[#CBD5E1]">
              <div className="text-xs font-bold text-[#0757A6] mb-1">04</div>
              <h3 className="text-xs font-bold text-[#0F172A]">Arrive at Optimal Time</h3>
              <p className="text-[11px] text-[#475467] mt-1 leading-relaxed">
                Follow AI timing recommendations to visit during lowest footfall hours.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-[#CBD5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs font-semibold text-[#0F172A]">
              "QueueWise turns unpredictable government visits into planned visits."
            </p>
            <button
              type="button"
              onClick={() => onGetStarted(null, null)}
              className="btn-primary py-2 px-5 text-xs font-bold shrink-0"
            >
              Start Planning
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}


