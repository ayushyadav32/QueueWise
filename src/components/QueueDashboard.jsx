import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  RefreshCw, TrendingUp, TrendingDown, Minus, Clock, Users, Activity,
  Bell, MessageSquarePlus, FileText, CheckCheck, ChevronDown, ChevronUp,
  ThumbsUp, Info, AlertTriangle, X, MapPin, Phone, Calendar, ArrowRight,
  Printer, Bookmark, Check, Shield, AlertCircle, Circle, Sparkles
} from 'lucide-react'
import { generateQueueData, weeklyPattern, seedReports } from '../data/mockData'
import CommunityReportModal from './CommunityReportModal'

const STATUS_CONFIG = {
  low:      { badge: 'badge badge-low',      bar: 'progress-fill-low',      label: 'Low',      color: 'text-emerald-700' },
  moderate: { badge: 'badge badge-moderate', bar: 'progress-fill-moderate', label: 'Moderate', color: 'text-amber-800' },
  high:     { badge: 'badge badge-high',     bar: 'progress-fill-high',     label: 'High',     color: 'text-orange-800' },
  critical: { badge: 'badge badge-critical', bar: 'progress-fill-critical', label: 'Critical', color: 'text-red-800' },
}

export default function QueueDashboard({
  office,
  service,
  currentUser = null,
  onRequireAuth,
  showToast,
  onSaveVisit,
  queueWatchers = {},
  onToggleQueueWatcher,
  onSimulateDrop,
  onLogActivity,
  onAddQueueReport,
}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [showReport, setShowReport] = useState(false)

  const isWatching = queueWatchers?.[office.id]?.enabled
  const currentThreshold = queueWatchers?.[office.id]?.threshold || 18
  const [reports, setReports] = useState(() => {
    try {
      const stored = localStorage.getItem('queuewise_community_reports')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) return [...parsed, ...seedReports]
      }
    } catch (e) {
      console.error(e)
    }
    return seedReports
  })
  const [alertFired, setAlertFired] = useState(false)
  
  // 3-State Document Verification Map: { [docKey]: 'ready' | 'missing' | 'optional' }
  const [docStates, setDocStates] = useState(() => {
    const initial = {}
    const req = service.requiredDocuments || service.documents.slice(0, 5)
    const opt = service.optionalDocuments || service.documents.slice(5)
    req.forEach((_, idx) => {
      // 4 out of 5 ready initially for the requested "4 / 5 ready, 80%" default showcase
      initial[`req-${idx}`] = idx < 4 ? 'ready' : 'missing'
    })
    opt.forEach((_, idx) => {
      initial[`opt-${idx}`] = 'optional'
    })
    return initial
  })

  const [showAllDocs, setShowAllDocs] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  // Re-synchronize document states if service changes
  useEffect(() => {
    const initial = {}
    const req = service.requiredDocuments || service.documents.slice(0, 5)
    const opt = service.optionalDocuments || service.documents.slice(5)
    req.forEach((_, idx) => {
      initial[`req-${idx}`] = idx < 4 ? 'ready' : 'missing'
    })
    opt.forEach((_, idx) => {
      initial[`opt-${idx}`] = 'optional'
    })
    setDocStates(initial)
  }, [service])

  const chart = weeklyPattern[office.id] || weeklyPattern.rto

  const loadData = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => {
      setData(generateQueueData(office.id, service.id, reports))
      setRefreshing(false)
      setLoading(false)
    }, 300)
  }, [office.id, service.id, reports])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 60000)
    return () => clearInterval(interval)
  }, [loadData])

  // Simulated queue alert after 8 seconds
  useEffect(() => {
    if (alertFired) {
      const timer = setTimeout(() => {
        showToast(`ðŸ”” Queue Alert: Queue at ${office.name} dropped below 15 people! Expected wait now 12 min.`, 'success')
        setAlertFired(false)
      }, 8000)
      return () => clearTimeout(timer)
    }
  }, [alertFired, office.name, showToast])

  const handleSetDocState = (key, state) => {
    setDocStates(prev => ({ ...prev, [key]: state }))
  }

  const reqDocs = useMemo(() => service.requiredDocuments || service.documents || [], [service])
  const optDocs = useMemo(() => service.optionalDocuments || [], [service])

  const readinessMetrics = useMemo(() => {
    let readyCount = 0
    let missingCount = 0
    let optionalCount = 0

    reqDocs.forEach((_, idx) => {
      const st = docStates[`req-${idx}`] || 'ready'
      if (st === 'ready') readyCount++
      else if (st === 'missing') missingCount++
      else if (st === 'optional') optionalCount++
    })

    optDocs.forEach((_, idx) => {
      const st = docStates[`opt-${idx}`] || 'optional'
      if (st === 'ready') readyCount++
      else if (st === 'optional') optionalCount++
    })

    const requiredTotal = Math.max(1, reqDocs.length)
    const percentage = Math.min(100, Math.round((readyCount / requiredTotal) * 100))

    return {
      readyCount,
      requiredTotal,
      percentage,
      missingCount,
      optionalCount,
    }
  }, [reqDocs, optDocs, docStates])

  const handleSaveSlip = () => {
    setIsSaved(true)
    const pass = {
      id: `QW-${Math.floor(1000 + Math.random() * 9000)}-UP`,
      officeName: office.name,
      serviceName: service.name,
      date: 'Today',
      status: 'Upcoming',
      recommendedSlot: data?.recommendedWindow ? `Today Â· ${data.recommendedWindow.time}` : 'Today Â· 2:00 â€“ 3:00 PM',
      expectedWait: data?.recommendedWindow?.expectedWait || '18â€“22 min',
      docsReady: `${readinessMetrics.readyCount} / ${readinessMetrics.requiredTotal} ready (${readinessMetrics.percentage}%)`,
      savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    if (onSaveVisit) {
      onSaveVisit(pass)
    }
    if (onLogActivity) {
      onLogActivity('visit', `Saved visit slip for ${service.name}`, office.name, service.name, `Recommended slot: ${pass.recommendedSlot}`)
    }
    showToast(`Visit slip saved to 'My Visits' tab!`, 'success')
  }

  const st = data?.status ? STATUS_CONFIG[data.status.level] : STATUS_CONFIG.low
  const visibleDocs = showAllDocs ? service.documents : service.documents.slice(0, 5)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">

      {/* â”€â”€ SECTION 1: WHERE ARE YOU GOING? â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="card p-5 bg-white border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-[#DCE7F2] border border-slate-200 flex items-center justify-center text-2xl shrink-0">
              {office.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="journey-step-tag">1. Destination</span>
                <span className="text-xs font-semibold text-[#344054] uppercase tracking-wider">{office.category}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">{office.fullName}</h1>
              <p className="text-xs text-[#344054] flex items-center gap-2 mt-1">
                <MapPin className="h-3.5 w-3.5 text-[#475467] shrink-0" />
                {office.address}, {office.city}
              </p>
            </div>
          </div>

          {/* Office Quick Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-xs pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
            <div className="bg-[#E8F0F8] px-3 py-2 rounded-lg border border-slate-200/80">
              <span className="text-[#475467] block text-[10px] uppercase font-bold">Office Hours</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Clock className="h-3.5 w-3.5 text-[#344054]" />
                {office.timings}
              </span>
            </div>
            <div className="bg-[#E8F0F8] px-3 py-2 rounded-lg border border-slate-200/80">
              <span className="text-[#475467] block text-[10px] uppercase font-bold">Helpline</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Phone className="h-3.5 w-3.5 text-[#344054]" />
                {office.phone}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${
                data?.isOpen
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-[#DCE7F2] text-[#344054]'
              }`}>
                <span className={`h-2 w-2 rounded-full ${data?.isOpen ? 'bg-emerald-600' : 'bg-slate-400'}`}
                  style={data?.isOpen ? { animation: 'pulse-dot 2s infinite' } : {}} />
                {data?.isOpen ? 'Office Open Now' : 'Closed Today'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€ SECTION 2: WHAT DO YOU NEED? â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="card p-5 bg-white border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="journey-step-tag">2. Service Details</span>
              <span className="text-xs font-semibold text-[#344054]">Official Citizen Procedure</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">{service.name}</h2>
            <p className="text-xs text-[#344054] mt-0.5">{service.description}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg text-right">
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Standard Counter Time</span>
              <span className="text-base font-bold text-blue-950 tabular-nums">~{service.avgTime} minutes</span>
            </div>
            <div className="bg-[#E8F0F8] border border-slate-200 px-3 py-2 rounded-lg text-right">
              <span className="text-[10px] font-bold text-[#1D2939] uppercase tracking-wider block">Required Documents</span>
              <span className="text-base font-bold text-slate-900 tabular-nums">{service.documents.length} verified items</span>
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€ SECTION 3: HOW BUSY IS IT? (VISUALLY DOMINANT QUEUE MONITOR) â”€â”€ */}
      <section className="card p-6 border-2 border-slate-300 shadow-md bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="journey-step-tag">3. Live Queue Monitor</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Community reported
              </span>
              <span className="text-xs font-semibold text-[#344054]">
                {data?.communityReportsToday || 24} updates today
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">{office.name.toUpperCase()} Â· CURRENT STATUS</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold text-[#475467] uppercase tracking-wider block">Trust & Recency</span>
              <span className="text-xs text-[#1D2939] font-medium">
                Last community update: <strong className="text-slate-900">{data?.lastCommunityUpdate || '4 minutes ago'}</strong>
              </span>
            </div>
            <button
              onClick={loadData}
              disabled={refreshing}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Syncingâ€¦' : 'Refresh Feed'}
            </button>
          </div>
        </div>

        {/* Large Monitoring Numbers Display */}
        {loading ? (
          <div className="py-12 space-y-4">
            <div className="skeleton h-14 w-full" />
            <div className="skeleton h-6 w-3/4" />
          </div>
        ) : (
          <div className="py-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 items-end">
              {/* People waiting */}
              <div className="bg-[#E8F0F8] p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-[#344054] uppercase tracking-wider block mb-1">
                  People Waiting
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-slate-900 tabular-nums leading-none">
                    {data?.isOpen ? data.count : '0'}
                  </span>
                  <span className="text-xs font-semibold text-[#344054]">citizens in line</span>
                </div>
              </div>

              {/* Estimated Wait */}
              <div className="bg-[#E8F0F8] p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-[#344054] uppercase tracking-wider block mb-1">
                  Estimated Wait Time
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-5xl font-extrabold text-slate-900 tabular-nums leading-none">
                    {data?.isOpen ? data.wait : '0'}
                  </span>
                  <span className="text-lg font-bold text-slate-700">min</span>
                </div>
              </div>

              {/* Crowd Level */}
              <div className="bg-[#E8F0F8] p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-[#344054] uppercase tracking-wider block mb-1">
                  Crowd Level
                </span>
                <div className="flex items-center gap-2 mt-1">
                  {st && <span className={`${st.badge} text-xs py-1 px-3`}>{st.label}</span>}
                  <span className="text-xs text-[#344054] font-medium capitalize">
                    {data?.trend === 'rising' ? 'â†‘ Rising surge' : data?.trend === 'falling' ? 'â†“ Queue easing' : 'â†’ Stable'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!currentUser && onRequireAuth) {
                      onRequireAuth(() => setShowAlert(true))
                      return
                    }
                    setShowAlert(true)
                  }}
                  className={`py-2.5 px-3 text-xs font-bold w-full justify-center shadow-xs flex items-center gap-1.5 rounded-lg border transition-all ${
                    isWatching
                      ? 'bg-blue-900 text-white border-blue-950 hover:bg-blue-800'
                      : 'btn-primary'
                  }`}
                  title="Notify me when the queue becomes shorter"
                >
                  <Bell className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {isWatching ? `Watching Queue Drops (<${currentThreshold}) âœ“` : 'Notify me when queue becomes shorter'}
                  </span>
                </button>
                <button
                  onClick={() => {
                    if (!currentUser && onRequireAuth) {
                      onRequireAuth(() => setShowReport(true))
                      return
                    }
                    setShowReport(true)
                  }}
                  className="btn-secondary py-2 text-xs font-bold w-full justify-center"
                >
                  <MessageSquarePlus className="h-4 w-4 text-[#1D2939]" />
                  Report Current Queue
                </button>
              </div>
            </div>

            {/* Horizontal Live Queue Meter */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-semibold text-[#1D2939] mb-2">
                <span>Station Capacity Threshold: {data?.capacityPct}% full</span>
                <span className="text-[#475467]">Normal operating limit: 50 people</span>
              </div>
              <div className="h-4 rounded-full bg-[#DCE7F2] p-0.5 border border-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full ${st?.bar} transition-all duration-1000 shadow-inner`}
                  style={{ width: `${data?.capacityPct || 0}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-bold text-[#475467] mt-1.5 uppercase tracking-wide">
                <span>0 Â· Empty</span>
                <span>25 Â· Moderate</span>
                <span>40 Â· High Surge</span>
                <span>50+ Â· Critical</span>
              </div>
            </div>

            {/* Citizen Queue Visualizer Dots */}
            {data?.isOpen && data.count > 0 && (
              <div className="mt-6 p-4 bg-[#E8F0F8] rounded-lg border border-slate-200">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Physical Queue Simulation ({Math.min(data.count, 45)} people represented)
                </p>
                <div className="flex flex-wrap gap-1.5 items-center">
                  {Array.from({ length: Math.min(data.count, 45) }).map((_, i) => {
                    const ratio = i / Math.min(data.count, 45)
                    const dotClass =
                      ratio < 0.25 ? 'bg-red-500' :
                      ratio < 0.55 ? 'bg-orange-400' :
                      ratio < 0.80 ? 'bg-amber-400' :
                      'bg-emerald-500'
                    return (
                      <span
                        key={i}
                        className={`h-3 w-3 rounded-full ${dotClass} transition-transform hover:scale-125`}
                        title={`Citizen ${i + 1}`}
                      />
                    )
                  })}
                  {data.count > 45 && (
                    <span className="text-xs font-bold text-[#344054] ml-2">+{data.count - 45} more waiting</span>
                  )}
                </div>
              </div>
            )}

            {/* Civic Transparency Notice */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#344054]">
              <div className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-[#475467] shrink-0" />
                <span>
                  <strong>Civic Data Notice:</strong> Live queue counts & wait estimates combine historical sensor models with real-time community reports from citizens on site. Not an official government record.
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#475467] shrink-0 uppercase">
                {data?.disclaimer || 'Verified Crowdsource Engine'}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* â”€â”€ SECTION 4: WHEN SHOULD YOU GO? (FORECAST & RECOMMENDED VISIT) â”€â”€ */}
      <section className="card p-6 bg-white border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="journey-step-tag">4. Optimal Timing</span>
              <span className="text-xs font-semibold text-[#344054]">90-Day Trend Intelligence</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">Today's Crowd Forecast & Arrival Windows</h2>
          </div>
          <span className="text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-200 px-3 py-1 rounded-md self-start sm:self-auto">
            Algorithm Confidence: {data?.recommendedWindow?.confidence || '87%'}
          </span>
        </div>

        {/* Clean Travel/Traffic Recommendation Panel */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-5 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-blue-200/80">
            <div>
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest block">Recommended Visit Window</span>
              <p className="text-2xl font-extrabold text-blue-950 mt-0.5">
                {data?.recommendedWindow ? `Today Â· ${data.recommendedWindow.time}` : 'Today Â· 2:00 PM â€“ 3:00 PM'}
              </p>
              <p className="text-xs text-blue-800 font-medium mt-1">
                Reason: "{data?.recommendedWindow?.explanation || 'Historical traffic is typically lower during this post-lunch clearance period.'}"
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-blue-200 shadow-2xs self-start sm:self-auto">
              <div>
                <span className="text-[10px] font-bold text-[#344054] uppercase block">Expected Wait</span>
                <span className="text-lg font-extrabold text-slate-900 tabular-nums">
                  {data?.recommendedWindow?.expectedWait || '18â€“22 min'}
                </span>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <span className="text-[10px] font-bold text-[#344054] uppercase block">Confidence</span>
                <span className="text-lg font-extrabold text-emerald-700">
                  {data?.recommendedWindow?.confidence || '87%'}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline Visualization: 09 AM | 11 AM | 01 PM | 03 PM | 05 PM */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
              <span>Hourly Crowd Intensity Timeline</span>
              <span className="text-blue-800 text-[11px] font-semibold">
                {data?.recommendedWindow ? `Save ~${data.recommendedWindow.savingsMinutes}m vs peak arrival` : 'Recommended Window Highlighted'}
              </span>
            </div>

            {/* Timeline Bars */}
            <div className="grid grid-cols-5 gap-3 pt-3">
              {(data?.hourlyForecast || [
                { time: '09:00 AM', crowdLevel: 'High', projectedWait: 45, capacityPct: 75, color: 'bg-orange-400', isBest: false },
                { time: '11:00 AM', crowdLevel: 'Surge', projectedWait: 65, capacityPct: 95, color: 'bg-red-500', isBest: false },
                { time: '01:00 PM', crowdLevel: 'Lunch Shift', projectedWait: 35, capacityPct: 55, color: 'bg-amber-400', isBest: false },
                { time: '03:00 PM', crowdLevel: 'Low', projectedWait: 18, capacityPct: 30, color: 'bg-emerald-500', isBest: true },
                { time: '05:00 PM', crowdLevel: 'Closing Dip', projectedWait: 25, capacityPct: 40, color: 'bg-blue-400', isBest: false },
              ]).map(slot => (
                <div
                  key={slot.time}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    slot.isBest
                      ? 'bg-white border-2 border-blue-700 shadow-md ring-2 ring-blue-100'
                      : 'bg-white/80 border-slate-200'
                  }`}
                >
                  {slot.isBest && (
                    <span className="bg-blue-800 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider block mb-1">
                      BEST TIME
                    </span>
                  )}
                  <span className="text-xs font-bold text-slate-900 block">{slot.time}</span>
                  <div className="h-1.5 w-full bg-[#DCE7F2] rounded-full my-2 overflow-hidden">
                    <div className={`h-full ${slot.color}`} style={{ width: `${slot.capacityPct || 50}%` }} />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 block">{slot.crowdLevel}</span>
                  <span className="text-[10px] text-[#344054] block">~{slot.projectedWait}m wait</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Day-by-Day Crowd Bar Chart */}
        <div className="card p-4 bg-[#E8F0F8] border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Weekly Historical Busyness</h3>
            <span className="text-[11px] text-[#344054]">Wednesday typically sees lowest queue volume</span>
          </div>
          <div className="flex items-end gap-3 h-20">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => {
              const val = chart[i] || 50
              const isBestDay = day === 'Wed'
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex items-end justify-center h-14">
                    <div
                      className={`w-full rounded-t transition-all ${isBestDay ? 'bg-blue-800' : 'bg-slate-300'}`}
                      style={{ height: `${(val / 100) * 56}px` }}
                      title={`${day}: ${val}% full`}
                    />
                  </div>
                  <span className={`text-[11px] font-bold ${isBestDay ? 'text-blue-900' : 'text-[#344054]'}`}>{day}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* â”€â”€ SECTION 5: ARE YOU READY? (DOCUMENT CHECKLIST & VISIT PLAN SLIP) â”€â”€ */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="journey-step-tag">5. Preparedness & Slip</span>
          <span className="text-xs font-semibold text-[#344054]">Document Verification & Citizen Pass</span>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Upgraded Official Document Checklist */}
          <div className="lg:col-span-6 card p-6 bg-white border-slate-200">
            {/* Header: Exact Required Text */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <span className="text-[10px] font-bold text-[#475467] uppercase tracking-widest block">CHECKLIST AUDIT</span>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">DOCUMENT READINESS</h3>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">
                  <span className="text-blue-900 font-bold">{readinessMetrics.readyCount} / {readinessMetrics.requiredTotal} ready</span> Â· <span className="text-emerald-700 font-extrabold">{readinessMetrics.percentage}%</span>
                </p>
              </div>
              <span className={`badge ${readinessMetrics.percentage === 100 ? 'badge-low' : 'badge-moderate'} text-xs font-bold py-1 px-2.5`}>
                {readinessMetrics.percentage === 100 ? 'âœ“ Ready to Visit' : `${readinessMetrics.missingCount} Missing`}
              </span>
            </div>

            {/* Checklist Progress Bar */}
            <div className="progress-track mb-5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  readinessMetrics.percentage === 100 ? 'bg-emerald-600' : 'bg-blue-800'
                }`}
                style={{ width: `${readinessMetrics.percentage}%` }}
              />
            </div>

            {/* Required Documents Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#1D2939] uppercase tracking-wider px-1">
                <span>Required Documents ({reqDocs.length})</span>
                <span className="text-[10px] text-[#475467] font-semibold">Mandatory for counter processing</span>
              </div>

              {reqDocs.map((doc, idx) => {
                const key = `req-${idx}`
                const status = docStates[key] || 'ready'
                return (
                  <div
                    key={key}
                    className={`p-3 rounded-lg border transition-all ${
                      status === 'ready'
                        ? 'bg-emerald-50/50 border-emerald-200 text-slate-900'
                        : status === 'missing'
                        ? 'bg-orange-50/60 border-orange-200 text-slate-900'
                        : 'bg-[#E8F0F8] border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <span className={`h-5 w-5 rounded flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                          status === 'ready'
                            ? 'bg-emerald-600 text-white'
                            : status === 'missing'
                            ? 'bg-orange-600 text-white'
                            : 'bg-slate-300 text-slate-700'
                        }`}>
                          {status === 'ready' ? 'âœ“' : status === 'missing' ? 'âš ' : 'â—‹'}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold leading-snug">{doc}</p>
                          <span className="text-[10px] font-bold text-[#475467] uppercase tracking-wide">
                            {status === 'ready' ? 'In hand' : status === 'missing' ? 'Pending obtainment' : 'Exempted'}
                          </span>
                        </div>
                      </div>

                      {/* 3 State Toggle Buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSetDocState(key, 'ready')}
                          className={`py-1 px-2.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                            status === 'ready'
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-[#1D2939] hover:bg-[#DCE7F2]'
                          }`}
                        >
                          <Check className="h-3 w-3 stroke-[3]" /> Ready
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetDocState(key, 'missing')}
                          className={`py-1 px-2.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                            status === 'missing'
                              ? 'bg-orange-600 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-[#1D2939] hover:bg-[#DCE7F2]'
                          }`}
                        >
                          <AlertTriangle className="h-3 w-3 stroke-[2.5]" /> Missing
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetDocState(key, 'optional')}
                          className={`py-1 px-2.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                            status === 'optional'
                              ? 'bg-slate-700 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-[#1D2939] hover:bg-[#DCE7F2]'
                          }`}
                        >
                          <Circle className="h-3 w-3 stroke-[2.5]" /> Optional
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Optional / Supporting Documents Section (if any) */}
            {optDocs.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#1D2939] uppercase tracking-wider px-1">
                  <span>Supporting Documents ({optDocs.length})</span>
                  <span className="text-[10px] text-[#475467] font-semibold">Conditional or situational</span>
                </div>

                {optDocs.map((doc, idx) => {
                  const key = `opt-${idx}`
                  const status = docStates[key] || 'optional'
                  return (
                    <div
                      key={key}
                      className={`p-3 rounded-lg border transition-all ${
                        status === 'ready'
                          ? 'bg-emerald-50/50 border-emerald-200 text-slate-900'
                          : status === 'missing'
                          ? 'bg-orange-50/60 border-orange-200 text-slate-900'
                          : 'bg-[#E8F0F8]/80 border-slate-200 text-[#1D2939]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <span className={`h-5 w-5 rounded flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                            status === 'ready'
                              ? 'bg-emerald-600 text-white'
                              : status === 'missing'
                              ? 'bg-orange-600 text-white'
                              : 'bg-slate-300 text-slate-700'
                          }`}>
                            {status === 'ready' ? 'âœ“' : status === 'missing' ? 'âš ' : 'â—‹'}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-medium leading-snug">{doc}</p>
                            <span className="text-[10px] font-semibold text-[#475467]">Optional Â· Attach if applicable</span>
                          </div>
                        </div>

                        {/* 3 State Toggle Buttons */}
                        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                          <button
                            type="button"
                            onClick={() => handleSetDocState(key, 'ready')}
                            className={`py-1 px-2.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                              status === 'ready'
                                ? 'bg-emerald-700 text-white shadow-xs'
                                : 'bg-white border border-slate-200 text-[#1D2939] hover:bg-[#DCE7F2]'
                            }`}
                          >
                            <Check className="h-3 w-3 stroke-[3]" /> Ready
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetDocState(key, 'missing')}
                            className={`py-1 px-2.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                              status === 'missing'
                                ? 'bg-orange-600 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-[#1D2939] hover:bg-[#DCE7F2]'
                            }`}
                          >
                            <AlertTriangle className="h-3 w-3 stroke-[2.5]" /> Missing
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetDocState(key, 'optional')}
                            className={`py-1 px-2.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                              status === 'optional'
                                ? 'bg-slate-700 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-[#1D2939] hover:bg-[#DCE7F2]'
                            }`}
                          >
                            <Circle className="h-3 w-3 stroke-[2.5]" /> Optional
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* â”€â”€ Before you visit: Concise Preparation Tips â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="mt-5 p-4 rounded-xl bg-blue-50/70 border border-blue-200/90">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-blue-800" />
                <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider">Before You Visit</h4>
              </div>
              <ul className="space-y-1.5">
                {(service.preparationTips || [
                  'Book a slot online where applicable prior to visiting the office counter.',
                  'Carry original physical documents alongside at least 2 self-attested photocopies.',
                  'Check that name and date of birth spellings match identically across all identity proofs.'
                ]).map((tip, idx) => (
                  <li key={idx} className="text-xs text-blue-900/90 flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-600 font-bold">â€¢</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* â”€â”€ Official Warning â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="mt-3.5 p-3 rounded-lg bg-amber-50 border border-amber-200/90 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                <strong>Warning:</strong> Requirements may vary by office and service. Verify official requirements before visiting.
              </p>
            </div>

            {/* â”€â”€ Demo Civic Information Notice â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="mt-3 text-center">
              <span className="text-[11px] text-[#475467] font-medium">
                Demo civic database Â· Not an official government integration Â· For visit optimization only
              </span>
            </div>
          </div>

          {/* Right Column: QUEUEWISE VISIT PLAN (Government Boarding Pass / Civic Slip) */}
          <div className="lg:col-span-6 civic-pass">
            {/* Pass Header */}
            <div className="civic-pass-header">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300 block">
                    GOVERNMENT OF UTTAR PRADESH Â· OFFICIAL VISIT ADVISORY
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-wide mt-0.5">QUEUEWISE VISIT PLAN</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#475467] uppercase tracking-widest block">PASS ID</span>
                  <span className="text-xs font-mono font-bold text-blue-300">QW-7829-UP</span>
                </div>
              </div>
            </div>

            {/* Pass Body */}
            <div className="p-6 bg-white space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-[#475467] uppercase tracking-wider block">Office Location</span>
                  <p className="text-sm font-bold text-slate-900">{office.name}</p>
                  <p className="text-[11px] text-[#344054] truncate">{office.address}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#475467] uppercase tracking-wider block">Target Service</span>
                  <p className="text-sm font-bold text-slate-900">{service.name}</p>
                  <p className="text-[11px] text-[#344054]">{office.category}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#E8F0F8] p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[9px] font-bold text-[#475467] uppercase tracking-wider block">Scheduled Slot</span>
                  <p className="text-xs font-bold text-blue-900 mt-0.5">Today</p>
                  <p className="text-[11px] font-semibold text-slate-700">
                    {data?.recommendedWindow?.time || '2:00â€“3:00 PM'}
                  </p>
                </div>

                <div className="bg-[#E8F0F8] p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[9px] font-bold text-[#475467] uppercase tracking-wider block">Expected Wait</span>
                  <p className="text-xs font-bold text-emerald-800 mt-0.5">
                    {data?.recommendedWindow?.expectedWait || '18â€“22 min'}
                  </p>
                  <p className="text-[10px] text-[#344054]">Low Congestion</p>
                </div>

                <div className="bg-[#E8F0F8] p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[9px] font-bold text-[#475467] uppercase tracking-wider block">Readiness</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    {readinessMetrics.readyCount} / {readinessMetrics.requiredTotal} Ready
                  </p>
                  <p className="text-[10px] text-emerald-700 font-bold">
                    {readinessMetrics.percentage}% Prepared
                  </p>
                </div>
              </div>

              {/* Perforated Notch Divider */}
              <div className="civic-pass-perforation" />

              {/* Barcode & Security Elements */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-[10px] font-mono text-[#344054]">VALID ON: {new Date().toLocaleDateString('en-GB')}</p>
                  <p className="text-[9px] text-[#475467]">NON-TRANSFERABLE Â· VERIFY AT COUNTER ENTRY</p>
                </div>

                {/* Simulated Barcode */}
                <div className="flex gap-0.5 h-7 items-center opacity-70">
                  {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3].map((w, i) => (
                    <span
                      key={i}
                      className="bg-slate-800 h-full inline-block"
                      style={{ width: `${w}px` }}
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons on Pass */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveSlip}
                  className="btn-primary flex-1 py-2 text-xs font-bold justify-center"
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  {isSaved ? 'Saved in My Visits âœ“' : 'Save Visit Plan'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAlert(true)}
                  className="btn-secondary py-2 text-xs font-bold justify-center"
                >
                  <Bell className="h-3.5 w-3.5 text-[#1D2939]" />
                  Set Reminder
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-secondary py-2 text-xs font-bold px-3"
                  title="Print Visit Pass"
                >
                  <Printer className="h-3.5 w-3.5 text-[#1D2939]" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* â”€â”€ Community Civic Reports Feed â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="card p-5 bg-white border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">VERIFIED CITIZEN REPORTS</h3>
            <p className="text-xs text-[#344054] mt-0.5">Crowdsourced updates from citizens currently at {office.name}</p>
          </div>
          <button
            onClick={() => {
              if (!currentUser && onRequireAuth) {
                onRequireAuth(() => setShowReport(true))
                return
              }
              setShowReport(true)
            }}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            + Add Report
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {reports.map(r => (
            <div key={r.id} className="p-3 rounded-lg border border-slate-200 bg-[#E8F0F8]/70 flex items-start gap-3">
              <div className="p-1.5 rounded bg-white border border-slate-200 text-xs">
                {r.type === 'decrease' ? 'â†“' : r.type === 'increase' ? 'â†‘' : 'â„¹'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-800 leading-snug">{r.text}</p>
                <span className="text-[10px] text-[#475467] mt-1 block font-medium">{r.ago}</span>
              </div>
              <button
                onClick={() => {
                  setReports(prev => prev.map(item => item.id === r.id ? { ...item, votes: item.votes + 1 } : item))
                }}
                className="flex items-center gap-1 text-[11px] font-bold text-[#1D2939] bg-white border border-slate-200 px-2 py-1 rounded hover:bg-[#DCE7F2]"
              >
                <ThumbsUp className="h-3 w-3" />
                {r.votes}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* â”€â”€ MODAL: Community Civic Queue Report â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {showReport && (
        <CommunityReportModal
          office={office}
          onClose={() => setShowReport(false)}
          showToast={showToast}
          onSubmit={(reportData) => {
            const crowdLevel =
              reportData.crowdCondition === 'Very High' ? 'critical' :
              reportData.crowdCondition === 'High' ? 'high' :
              reportData.crowdCondition === 'Low' ? 'low' : 'moderate'

            const newFeedItem = {
              id: reportData.id || Date.now(),
              waitingRange: reportData.waitingRange,
              estimatedWait: reportData.estimatedWait,
              crowdCondition: reportData.crowdCondition,
              note: reportData.note,
              ago: 'Just now',
              text: `${reportData.waitingRange} people waiting (~${reportData.estimatedWait} wait). ${reportData.note ? reportData.note : 'Condition: ' + reportData.crowdCondition}`,
              type: crowdLevel === 'high' || crowdLevel === 'critical' ? 'increase' : crowdLevel === 'low' ? 'decrease' : 'info',
              crowdReported: crowdLevel,
              votes: 1,
            }

            setReports(prev => [newFeedItem, ...prev])
            setShowReport(false)
            if (onAddQueueReport) {
              onAddQueueReport({
                officeId: office.id,
                officeName: office.name,
                serviceId: service.id,
                serviceName: service.name,
                ...reportData,
              })
            }
            if (onLogActivity) {
              onLogActivity('queue_report', `Reported queue at ${office.name}`, office.name, service.name, `${reportData.waitingRange} waiting Â· ${reportData.estimatedWait}`)
            }
            showToast('âœ“ Community update received. Queue prediction calibrated!', 'success')
          }}
        />
      )}

      {/* â”€â”€ MODAL: Queue Alert â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {showAlert && (
        <QueueAlertModal
          office={office}
          isWatching={isWatching}
          initialThreshold={currentThreshold}
          onClose={() => setShowAlert(false)}
          onConfirm={(threshold) => {
            if (onToggleQueueWatcher) {
              onToggleQueueWatcher(office.id, threshold)
            }
            if (onLogActivity) {
              onLogActivity('reminder', `Subscribed to queue alerts for ${office.name}`, office.name, service.name, `Threshold: < ${threshold} people`)
            }
            setShowAlert(false)
          }}
          onSimulateNow={() => {
            if (onSimulateDrop) {
              onSimulateDrop(office.id)
            }
            setShowAlert(false)
          }}
        />
      )}
    </div>
  )
}

// â”€â”€â”€ Component: Queue Alert Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function QueueAlertModal({ office, isWatching, initialThreshold = 18, onClose, onConfirm, onSimulateNow }) {
  const [threshold, setThreshold] = useState(initialThreshold)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs anim-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 anim-scale-in overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-[#E8F0F8]">
          <div>
            <span className="text-[10px] font-bold text-[#475467] uppercase tracking-widest block">CIVIC NOTIFICATION</span>
            <h3 className="text-base font-bold text-slate-900">Notify Me When Queue Becomes Shorter</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 text-[#475467] hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-[#1D2939] leading-relaxed">
            We will monitor queue fluctuations at <strong>{office.name}</strong> and deliver an in-app notification & toast alert as soon as the line drops below your comfort threshold.
          </p>

          <div>
            <label className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              <span>Notify when queue drops below:</span>
              <span className="text-blue-900 text-sm font-extrabold">{threshold} people</span>
            </label>
            <input
              type="range"
              min="5"
              max="30"
              step="5"
              value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
              className="w-full accent-blue-900 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-bold text-[#475467] mt-1">
              <span>5 (Fastest)</span>
              <span>15 (Comfortable)</span>
              <span>30 (Standard)</span>
            </div>
          </div>

          {/* Sample Notification Preview */}
          <div className="p-3 bg-[#E8F0F8] border border-slate-200 rounded-xl space-y-1">
            <span className="text-[9px] font-extrabold text-[#475467] uppercase tracking-wider block">
              ALERT PREVIEW (WHEN TRIGGERED)
            </span>
            <div className="p-2.5 bg-white rounded-lg border border-emerald-200/80 text-xs shadow-2xs">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-0.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Queue is getting shorter
              </div>
              <p className="text-slate-900 font-semibold">{office.name}</p>
              <p className="text-[11px] text-[#1D2939]">Current queue: 14 people Â· Estimated wait: 17 minutes</p>
              <p className="text-[11px] text-emerald-700 font-medium italic mt-1">"Now may be a good time to visit."</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2 text-xs font-semibold">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onConfirm(threshold)}
                className="btn-primary flex-1 py-2 text-xs font-bold justify-center"
              >
                {isWatching ? 'Update Alert' : 'Activate Alert'}
              </button>
            </div>

            {/* Hackathon Fast Demo Trigger Button */}
            <button
              type="button"
              onClick={onSimulateNow}
              className="w-full py-2 px-3 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              âš¡ Activate & Trigger Simulated Alert Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


