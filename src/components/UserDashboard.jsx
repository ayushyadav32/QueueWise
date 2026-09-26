import { useState, useMemo } from 'react'
import {
  Calendar,
  Clock,
  MapPin,
  CheckCheck,
  Printer,
  Trash2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Bell,
  Plus,
  Sparkles,
  Ticket,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Activity,
  FileText,
  Radio,
  Eye,
  Filter,
  Check,
} from 'lucide-react'
import { groupActivitiesByTime } from '../utils/auth'

export default function UserDashboard({
  currentUser,
  visits = [],
  activities = [],
  queueReports = [],
  initialSection = 'overview', // 'overview' | 'visits' | 'history'
  onPlanNew,
  onUpdateVisitStatus,
  onToggleReminder,
  onRemoveVisit,
  onClearHistory,
  showToast,
}) {
  const [activeSection, setActiveSection] = useState(initialSection)
  const [visitStatusFilter, setVisitStatusFilter] = useState('all') // 'all' | 'Upcoming' | 'Completed' | 'Cancelled'
  const [historyFilter, setHistoryFilter] = useState('All') // 'All' | 'Visits' | 'Queue Reports' | 'Documents' | 'Notifications'

  // Extract first name dynamically
  const firstName = currentUser?.name ? currentUser.name.trim().split(' ')[0] : 'Citizen'

  // Filtered visits
  const filteredVisits = useMemo(() => {
    if (visitStatusFilter === 'all') return visits
    return visits.filter(v => (v.status || 'Upcoming') === visitStatusFilter)
  }, [visits, visitStatusFilter])

  // Count visits by status
  const counts = useMemo(() => {
    const upcoming = visits.filter(v => (v.status || 'Upcoming') === 'Upcoming').length
    const completed = visits.filter(v => v.status === 'Completed').length
    const cancelled = visits.filter(v => v.status === 'Cancelled').length
    return { all: visits.length, upcoming, completed, cancelled }
  }, [visits])

  // Filtered activities
  const filteredActivities = useMemo(() => {
    if (historyFilter === 'All') return activities
    if (historyFilter === 'Visits') {
      return activities.filter(a => a.type === 'visit')
    }
    if (historyFilter === 'Queue Reports') {
      return activities.filter(a => a.type === 'queue_report')
    }
    if (historyFilter === 'Documents') {
      return activities.filter(a => a.type === 'document')
    }
    if (historyFilter === 'Notifications') {
      return activities.filter(a => a.type === 'notification' || a.type === 'reminder')
    }
    return activities
  }, [activities, historyFilter])

  // Grouped activities for timeline
  const groupedActivities = useMemo(() => {
    return groupActivitiesByTime(filteredActivities)
  }, [filteredActivities])

  const isBrandNewUser = visits.length === 0 && activities.length === 0

  const handleStatusChange = (visitId, newStatus) => {
    if (onUpdateVisitStatus) {
      onUpdateVisitStatus(visitId, newStatus)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 anim-slide-up">

      {/* ── TOP WELCOME BANNER ───────────────────────────────────────── */}
      <div className="card p-6 bg-white border border-[#E4E7EC] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#0B5CAD] bg-[#EFF6FC] border border-[#D0E4F7] px-2 py-0.5 rounded uppercase tracking-wider">
                PERSONAL CITIZEN DASHBOARD · LUCKNOW DISTRICT
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
              Welcome, {firstName}
            </h1>
            <p className="text-xs text-[#667085] mt-1 max-w-2xl leading-relaxed">
              {isBrandNewUser
                ? "Let's plan your first visit."
                : 'Track your scheduled civic appointments, review live queue reports, and inspect your private activity log.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onPlanNew}
              className="btn-primary py-2 px-4 text-xs font-bold shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Plan New Visit</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="pt-3 border-t border-[#E4E7EC] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1 bg-[#F6F8FB] p-1 rounded-lg border border-[#E4E7EC]">
            <button
              type="button"
              onClick={() => setActiveSection('overview')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeSection === 'overview'
                  ? 'bg-[#0B5CAD] text-white shadow-xs'
                  : 'text-[#667085] hover:text-[#172033]'
              }`}
            >
              Dashboard Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('visits')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                activeSection === 'visits'
                  ? 'bg-[#0B5CAD] text-white shadow-xs'
                  : 'text-[#667085] hover:text-[#172033]'
              }`}
            >
              <span>My Visits</span>
              {visits.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#094B8F] text-white text-[10px]">
                  {visits.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('history')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                activeSection === 'history'
                  ? 'bg-[#0B5CAD] text-white shadow-xs'
                  : 'text-[#667085] hover:text-[#172033]'
              }`}
            >
              <span>History</span>
              {activities.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-[#172033] text-[10px]">
                  {activities.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[#667085] text-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-[#0F766E]" />
            <span>Strict User Data Partition Active</span>
          </div>
        </div>
      </div>

      {/* ── BRAND NEW USER EMPTY STATE (WHEN 0 VISITS AND 0 ACTIVITIES) ─── */}
      {isBrandNewUser && (
        <div className="card p-10 sm:p-14 text-center bg-white border-2 border-dashed border-slate-200 shadow-xs max-w-2xl mx-auto anim-scale-up">
          <div className="h-16 w-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-center mx-auto text-3xl font-bold mb-4 shadow-2xs">
            🏛️
          </div>
          <span className="journey-step-tag mb-2">Getting Started</span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Welcome, {firstName}
          </h2>
          <p className="text-base font-bold text-blue-900 mt-2">
            Plan your first government visit.
          </p>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            You don't have any saved visits or activity history yet. As you search offices, check queues, match documents, and save visit plans, your personalized civic records will dynamically appear here.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={onPlanNew}
              className="btn-primary py-3 px-6 text-xs sm:text-sm font-bold shadow-xs w-full sm:w-auto justify-center"
            >
              <Plus className="h-4 w-4" />
              <span>Plan your first government visit</span>
            </button>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-blue-800 uppercase block">Step 1</span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">Select Office</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Pick RTO, DM, Municipal, Tehsil, or Passport.</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-blue-800 uppercase block">Step 2</span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">Inspect Queues</p>
              <p className="text-[11px] text-slate-500 mt-0.5">View real-time lines & AI recommended window.</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-blue-800 uppercase block">Step 3</span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">Verify Checklist</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Mark required documents & download your pass.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 1: DASHBOARD OVERVIEW ───────────────────────────── */}
      {(!isBrandNewUser || activeSection !== 'overview') && activeSection === 'overview' && (
        <div className="space-y-6 anim-slide-up">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-4 bg-white border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                UPCOMING VISITS
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-blue-900 tabular-nums">
                  {counts.upcoming}
                </span>
                <span className="text-xs text-blue-700 font-semibold">Scheduled</span>
              </div>
            </div>

            <div className="card p-4 bg-white border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                COMPLETED VISITS
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-emerald-800 tabular-nums">
                  {counts.completed}
                </span>
                <span className="text-xs text-emerald-700 font-semibold">Done</span>
              </div>
            </div>

            <div className="card p-4 bg-white border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                COMMUNITY REPORTS
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                  {Math.max(queueReports.length, activities.filter(a => a.type === 'queue_report').length)}
                </span>
                <span className="text-xs text-slate-500 font-semibold">Contributed</span>
              </div>
            </div>

            <div className="card p-4 bg-white border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                RECORDED ACTIVITIES
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                  {activities.length}
                </span>
                <span className="text-xs text-slate-500 font-semibold">Audit trail</span>
              </div>
            </div>
          </div>

          {/* Grid: Next Upcoming Visit & Recent Activity */}
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left: Next Upcoming Visit Card */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Next Scheduled Visit
                </h3>
                {visits.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveSection('visits')}
                    className="text-xs font-bold text-blue-800 hover:underline"
                  >
                    View all ({visits.length}) →
                  </button>
                )}
              </div>

              {counts.upcoming > 0 ? (
                (() => {
                  const nextVisit = visits.find(v => (v.status || 'Upcoming') === 'Upcoming') || visits[0]
                  return (
                    <div className="card p-5 bg-white border-2 border-blue-200 shadow-xs">
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                        <div>
                          <span className="badge badge-low text-[10px] py-0.5 px-2">Upcoming Appointment</span>
                          <h4 className="text-base font-bold text-slate-900 mt-1">{nextVisit.serviceName}</h4>
                          <p className="text-xs text-slate-500">{nextVisit.officeName}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-mono font-bold text-slate-400 block">{nextVisit.id}</span>
                          <span className="text-xs font-bold text-blue-900">{nextVisit.recommendedSlot}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 py-3 text-xs border-b border-slate-100">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Expected Wait:</span>
                          <strong className="text-slate-900">{nextVisit.expectedWait}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Document Checklist:</span>
                          <strong className="text-emerald-700">{nextVisit.docsReady}</strong>
                        </div>
                      </div>

                      <div className="pt-3 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(nextVisit.id, 'Completed')}
                          className="btn-secondary py-1 px-3 text-xs font-bold text-emerald-800 hover:bg-emerald-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Mark Completed
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSection('visits')}
                          className="btn-primary py-1 px-3 text-xs font-bold"
                        >
                          Manage Pass
                        </button>
                      </div>
                    </div>
                  )
                })()
              ) : (
                <div className="card p-8 text-center bg-white border-slate-200">
                  <Ticket className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No upcoming visits scheduled</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Plan your next visit to receive proactive arrival advisories.</p>
                  <button
                    type="button"
                    onClick={onPlanNew}
                    className="btn-primary mt-4 py-1.5 px-4 text-xs font-bold mx-auto"
                  >
                    + Plan Visit
                  </button>
                </div>
              )}
            </div>

            {/* Right: RECENT ACTIVITY (Dynamic feed) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Recent Activity
                </h3>
                {activities.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveSection('history')}
                    className="text-xs font-bold text-blue-800 hover:underline"
                  >
                    Full History ({activities.length}) →
                  </button>
                )}
              </div>

              {activities.length > 0 ? (
                <div className="card p-4 bg-white border-slate-200 divide-y divide-slate-100 shadow-xs">
                  {activities.slice(0, 5).map((act) => {
                    const iconMap = {
                      visit: Ticket,
                      queue_report: Radio,
                      queue_check: Activity,
                      office_search: MapPin,
                      service_select: FileText,
                      document: ShieldCheck,
                      reminder: Bell,
                      notification: Bell,
                    }
                    const Icon = iconMap[act.type] || Activity

                    return (
                      <div key={act.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-3">
                        <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 shrink-0 mt-0.5">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 leading-snug">
                            {act.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                            {act.office && <span className="font-semibold text-slate-700">{act.office}</span>}
                            {act.details && <span>· {act.details}</span>}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="card p-8 text-center bg-white border-slate-200">
                  <Activity className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No recent activity</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Your actions across QueueWise will automatically be recorded here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 2: MY VISITS ─────────────────────────────────────── */}
      {(!isBrandNewUser || activeSection === 'visits') && activeSection === 'visits' && (
        <div className="space-y-6 anim-slide-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
            <div>
              <span className="journey-step-tag">Active Passes</span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">My Visits</h2>
              <p className="text-xs text-slate-500">
                Official digital appointment slips and verified document checklists for {currentUser?.name}.
              </p>
            </div>

            {/* Visit Status Filters: All, Upcoming, Completed, Cancelled */}
            <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-lg text-xs font-bold">
              <button
                type="button"
                onClick={() => setVisitStatusFilter('all')}
                className={`px-3 py-1 rounded-md transition-all ${
                  visitStatusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({counts.all})
              </button>
              <button
                type="button"
                onClick={() => setVisitStatusFilter('Upcoming')}
                className={`px-3 py-1 rounded-md transition-all ${
                  visitStatusFilter === 'Upcoming'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Upcoming ({counts.upcoming})
              </button>
              <button
                type="button"
                onClick={() => setVisitStatusFilter('Completed')}
                className={`px-3 py-1 rounded-md transition-all ${
                  visitStatusFilter === 'Completed'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Completed ({counts.completed})
              </button>
              <button
                type="button"
                onClick={() => setVisitStatusFilter('Cancelled')}
                className={`px-3 py-1 rounded-md transition-all ${
                  visitStatusFilter === 'Cancelled'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cancelled ({counts.cancelled})
              </button>
            </div>
          </div>

          {/* Visits Cards Grid */}
          {filteredVisits.length === 0 ? (
            <div className="card p-12 text-center bg-white border-slate-200 max-w-lg mx-auto">
              <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto text-xl font-bold mb-3">
                🎫
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {visitStatusFilter === 'all'
                  ? 'No Visit Passes Saved Yet'
                  : `No ${visitStatusFilter} Visits Found`}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                {visitStatusFilter === 'all'
                  ? 'Plan your visit to generate an official digital advisory pass with document checklist.'
                  : `You do not have any visits marked as ${visitStatusFilter}.`}
              </p>
              {visitStatusFilter === 'all' && (
                <button
                  type="button"
                  onClick={onPlanNew}
                  className="btn-primary mt-5 py-2 px-5 text-xs font-bold mx-auto shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  Plan a Visit Now
                </button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredVisits.map(pass => {
                const status = pass.status || 'Upcoming'
                const isUpcoming = status === 'Upcoming'
                const isCompleted = status === 'Completed'
                const isCancelled = status === 'Cancelled'
                const isReminderOn = pass.reminderActive !== false

                return (
                  <div key={pass.id} className="civic-pass shadow-sm">
                    {/* Pass Header */}
                    <div className={`civic-pass-header flex items-center justify-between ${
                      isCompleted ? 'bg-emerald-950' : isCancelled ? 'bg-slate-800' : 'bg-slate-900'
                    }`}>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : isCancelled
                              ? 'bg-amber-600 text-white'
                              : 'bg-blue-600 text-white'
                          }`}>
                            {status}
                          </span>
                          <span className="text-[9px] uppercase font-bold tracking-widest text-slate-300">
                            VISIT PASS
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white tracking-wide">{pass.serviceName}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">PASS ID</span>
                        <span className="text-xs font-mono font-bold text-blue-300">{pass.id}</span>
                      </div>
                    </div>

                    {/* Pass Details */}
                    <div className="p-6 bg-white space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                        <span className="text-slate-500 font-medium">Citizen Name:</span>
                        <strong className="text-slate-900">{pass.citizenName || currentUser?.name || 'Citizen'}</strong>
                      </div>

                      {/* Required Fields: Office, Service, Date, Recommended Time, Expected Wait, Visit Status */}
                      <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Office</span>
                          <p className="font-bold text-slate-900">{pass.officeName}</p>
                          <p className="text-[11px] text-slate-500">Lucknow Central Hub</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Service</span>
                          <p className="font-bold text-slate-900">{pass.serviceName}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Date</span>
                          <p className="text-xs font-bold text-slate-900 mt-0.5">{pass.date || 'Today'}</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Recommended Time</span>
                          <p className="text-xs font-bold text-blue-900 mt-0.5">{pass.recommendedSlot}</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Expected Wait</span>
                          <p className="text-xs font-bold text-emerald-800 mt-0.5">{pass.expectedWait}</p>
                        </div>
                      </div>

                      {/* Document Readiness Pill */}
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                        <span className="text-slate-500 font-medium">Document Readiness:</span>
                        <strong className="text-emerald-700 font-bold">{pass.docsReady || 'Verified 100%'}</strong>
                      </div>

                      {/* Perforation */}
                      <div className="civic-pass-perforation" />

                      {/* Action Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        {/* Status Toggle Actions */}
                        <div className="flex items-center gap-1.5">
                          {isUpcoming && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(pass.id, 'Completed')}
                                className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 flex items-center gap-1 transition-colors"
                                title="Mark this appointment completed"
                              >
                                <Check className="h-3 w-3" />
                                <span>Completed</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(pass.id, 'Cancelled')}
                                className="px-2.5 py-1 rounded text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 flex items-center gap-1 transition-colors"
                                title="Cancel this appointment"
                              >
                                <XCircle className="h-3 w-3" />
                                <span>Cancel</span>
                              </button>
                            </>
                          )}
                          {!isUpcoming && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(pass.id, 'Upcoming')}
                              className="px-2.5 py-1 rounded text-xs font-bold bg-blue-50 text-blue-800 border border-blue-300 hover:bg-blue-100 flex items-center gap-1 transition-colors"
                              title="Restore to Upcoming"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span>Restore</span>
                            </button>
                          )}
                        </div>

                        {/* Secondary utilities */}
                        <div className="flex items-center gap-1.5 ml-auto">
                          <button
                            type="button"
                            onClick={() => onToggleReminder && onToggleReminder(pass.id)}
                            className={`p-1.5 rounded-lg border text-xs transition-colors ${
                              isReminderOn
                                ? 'bg-blue-50 border-blue-300 text-blue-900'
                                : 'bg-white border-slate-300 text-slate-400'
                            }`}
                            title={isReminderOn ? 'Reminder Active' : 'Enable Reminder'}
                          >
                            <Bell className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
                            title="Print Pass"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onRemoveVisit && onRemoveVisit(pass.id)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Pass"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── SECTION 3: HISTORY ───────────────────────────────────────── */}
      {(!isBrandNewUser || activeSection === 'history') && activeSection === 'history' && (
        <div className="space-y-6 anim-slide-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
            <div>
              <span className="journey-step-tag">Audit Trail</span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">Citizen Activity History</h2>
              <p className="text-xs text-slate-500">
                Automated local ledger recording all searches, queue inspections, document checklists, and visit plans for {currentUser?.name}.
              </p>
            </div>

            {/* History Category Filters */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/80 rounded-lg text-xs font-bold">
              {['All', 'Visits', 'Queue Reports', 'Documents', 'Notifications'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setHistoryFilter(cat)}
                  className={`px-3 py-1 rounded-md transition-all ${
                    historyFilter === cat
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grouped Chronological Timeline */}
          {groupedActivities.length === 0 ? (
            <div className="card p-12 text-center bg-white border-slate-200 max-w-lg mx-auto anim-scale-up">
              <div className="h-14 w-14 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto text-2xl font-bold mb-4">
                🕒
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                No activity yet
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Your QueueWise activity will appear here as you use the platform.
              </p>
              <button
                type="button"
                onClick={onPlanNew}
                className="btn-primary mt-6 py-2 px-5 text-xs font-bold mx-auto shadow-xs"
              >
                <Plus className="h-4 w-4" />
                Plan your first government visit
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedActivities.map((group) => (
                <div key={group.label} className="space-y-3">
                  {/* Relative Day Header */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900 bg-slate-200 px-2.5 py-1 rounded-md">
                      {group.label}
                    </span>
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-[10px] text-slate-400 font-medium">
                      {group.items.length} {group.items.length === 1 ? 'event' : 'events'}
                    </span>
                  </div>

                  {/* Activity Item List */}
                  <div className="card bg-white border-slate-200 divide-y divide-slate-100 shadow-xs">
                    {group.items.map((item) => (
                      <div key={item.id} className="p-3.5 sm:px-5 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="text-emerald-700 font-bold text-sm shrink-0 mt-0.5">
                            ✓
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 leading-snug">
                              {item.title}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                              {item.office && (
                                <span className="font-semibold text-slate-700">{item.office}</span>
                              )}
                              {item.service && (
                                <span>· {item.service}</span>
                              )}
                              {item.details && (
                                <span>· {item.details}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <span className="text-[11px] font-mono font-semibold text-slate-400 shrink-0">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {activities.length > 0 && onClearHistory && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={onClearHistory}
                    className="text-xs text-slate-400 hover:text-red-700 transition-colors"
                  >
                    Clear history trail
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  )
}
