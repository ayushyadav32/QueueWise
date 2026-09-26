import { useState, useMemo } from 'react'
import { analyticsData, offices } from '../data/mockData'
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle, ShieldAlert,
  CheckCircle2, Bell, Radio, Users, Clock, Building2, RefreshCw,
  Send, ExternalLink, Filter, Calendar, Check, ArrowUpRight,
  BarChart3, PieChart, Activity, ShieldCheck, Zap, Info, Sparkles
} from 'lucide-react'

const CROWD_BADGES = {
  low:      { badge: 'badge badge-low',      color: 'text-emerald-700', bg: 'bg-emerald-500', label: 'LOW' },
  moderate: { badge: 'badge badge-moderate', color: 'text-amber-800',   bg: 'bg-amber-400',   label: 'MODERATE' },
  high:     { badge: 'badge badge-high',     color: 'text-orange-800',  bg: 'bg-orange-500',  label: 'HIGH' },
  critical: { badge: 'badge badge-critical', color: 'text-red-800',     bg: 'bg-red-500',     label: 'CRITICAL' },
}

export default function AnalyticsDashboard({ showToast }) {
  const [timeFilter, setTimeFilter] = useState('today') // 'today' | 'week'
  const [officeFilter, setOfficeFilter] = useState('all') // 'all' | officeId
  const [dispatchedActions, setDispatchedActions] = useState({})
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState({})
  const [isSyncing, setIsSyncing] = useState(false)

  // Current metric values based on time filter
  const isToday = timeFilter === 'today'
  const currentSummary = isToday ? analyticsData.summary : analyticsData.summary.weekly
  const currentHourlyTrends = isToday ? analyticsData.hourlyTrends : analyticsData.weeklyHourlyTrends

  // Filtered telemetry rows
  const filteredTelemetry = useMemo(() => {
    if (officeFilter === 'all') return analyticsData.officeTelemetry
    return analyticsData.officeTelemetry.filter(row => row.id === officeFilter)
  }, [officeFilter])

  // Filtered attention required alerts
  const filteredAlerts = useMemo(() => {
    if (officeFilter === 'all') return analyticsData.attentionRequired
    return analyticsData.attentionRequired.filter(row => row.id === officeFilter)
  }, [officeFilter])

  // Handlers
  const handleDeployRelief = (alertId) => {
    setDispatchedActions(prev => ({ ...prev, [alertId]: true }))
    if (showToast) {
      showToast(`âœ“ Relief counter dispatched for ${alertId.toUpperCase()}! Station throughput augmented.`, 'success')
    }
  }

  const handleBroadcast = (officeName) => {
    if (showToast) {
      showToast(`âœ“ Public advisory broadcast sent to QueueWise citizen mobile users for ${officeName}.`, 'info')
    }
  }

  const handleAcknowledge = (alertId) => {
    setAcknowledgedAlerts(prev => ({ ...prev, [alertId]: true }))
    if (showToast) {
      showToast(`Alert acknowledged and logged in civic dispatch audit.`, 'info')
    }
  }

  const handleSyncTelemetry = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
      if (showToast) {
        showToast(`âœ“ Telemetry synchronized across all 5 district administrative hubs.`, 'success')
      }
    }, 450)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 anim-slide-up">

      {/* â”€â”€ DISTRICT OPERATIONS COMMAND HEADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="card p-6 bg-white border border-[#CBD5E1] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#059669]"></span>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#059669]">
                District Operations Control Room Â· Live Command
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">DISTRICT SERVICE MONITOR</h1>
            <p className="text-xs text-[#475467] mt-1">
              Lucknow Central Administration Â· Real-time civic queue telemetry, throughput analytics & congestion response
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-[#ECFDF5] px-3 py-1.5 rounded-lg border border-[#A7F3D0] text-right">
              <span className="text-[9px] font-bold text-[#065F46] uppercase block leading-none">SYSTEM UPTIME</span>
              <span className="text-xs font-bold text-[#059669] leading-normal">99.98% Â· 5 of 5 Hubs Online</span>
            </div>
            <button
              type="button"
              onClick={handleSyncTelemetry}
              disabled={isSyncing}
              className="btn-secondary py-2 px-3 text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-[#0757A6]' : ''}`} />
              <span>Sync Telemetry</span>
            </button>
          </div>
        </div>

        {/* â”€â”€ FILTER CONTROLS BAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="mt-6 pt-5 border-t border-[#CBD5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Time Filter: Today | This Week */}
          <div className="flex items-center gap-1 bg-[#EEF3F8] p-1 rounded-lg border border-[#CBD5E1]">
            <span className="text-[10px] uppercase font-bold text-[#475467] px-2">TIMEFRAME:</span>
            <button
              type="button"
              onClick={() => setTimeFilter('today')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                timeFilter === 'today'
                  ? 'bg-[#0757A6] text-white shadow-xs'
                  : 'text-[#475467] hover:text-[#0F172A]'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('week')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                timeFilter === 'week'
                  ? 'bg-[#0757A6] text-white shadow-xs'
                  : 'text-[#475467] hover:text-[#0F172A]'
              }`}
            >
              This Week
            </button>
          </div>

          {/* Office Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-[#475467] shrink-0" />
            <span className="text-[10px] font-bold text-[#475467] uppercase">OFFICE SCOPE:</span>
            <select
              value={officeFilter}
              onChange={e => setOfficeFilter(e.target.value)}
              className="bg-white border border-[#CBD5E1] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#0F172A] focus-ring cursor-pointer"
            >
              <option value="all">All Offices (District-Wide)</option>
              {offices.map(o => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* â”€â”€ EXACT 4 KPI CARDS BAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {/* KPI 1: OFFICES MONITORED */}
          <div className="bg-[#EEF3F8] p-4 rounded-xl border border-[#CBD5E1]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#475467] uppercase tracking-wider block">
                OFFICES MONITORED
              </span>
              <Building2 className="h-4 w-4 text-[#0757A6]" />
            </div>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl font-black text-[#0F172A] tabular-nums tracking-tight">
                {currentSummary.officesMonitored}
              </span>
              <span className="text-xs text-[#059669] font-bold">All Connected</span>
            </div>
            <span className="text-[10px] text-[#475467] block mt-1">
              RTO, DM, Municipal, Tehsil, Passport
            </span>
          </div>

          {/* KPI 2: ACTIVE QUEUE ALERTS */}
          <div className="bg-[#EEF3F8] p-4 rounded-xl border border-[#CBD5E1]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#475467] uppercase tracking-wider block">
                ACTIVE QUEUE ALERTS
              </span>
              <AlertTriangle className="h-4 w-4 text-[#DC2626]" />
            </div>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl font-black text-[#DC2626] tabular-nums tracking-tight">
                {currentSummary.activeQueueAlerts}
              </span>
              <span className="text-xs text-[#DC2626] font-bold">Surge Level</span>
            </div>
            <span className="text-[10px] text-[#475467] block mt-1">
              Passport Seva & RTO Office flagged
            </span>
          </div>

          {/* KPI 3: AVERAGE WAIT */}
          <div className="bg-[#EEF3F8] p-4 rounded-xl border border-[#CBD5E1]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#475467] uppercase tracking-wider block">
                AVERAGE WAIT
              </span>
              <Clock className="h-4 w-4 text-[#087F75]" />
            </div>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl font-black text-[#0F172A] tabular-nums tracking-tight">
                {currentSummary.averageWait}
              </span>
              <span className="text-xs text-[#475467] font-semibold">District Mean</span>
            </div>
            <span className="text-[10px] text-[#475467] block mt-1">
              Target SLA benchmark: &lt;45 min
            </span>
          </div>

          {/* KPI 4: COMMUNITY REPORTS */}
          <div className="bg-[#EEF3F8] p-4 rounded-xl border border-[#CBD5E1]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#475467] uppercase tracking-wider block">
                COMMUNITY REPORTS
              </span>
              <Users className="h-4 w-4 text-[#0757A6]" />
            </div>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl font-black text-[#0F172A] tabular-nums tracking-tight">
                {currentSummary.communityReports}
              </span>
              <span className="text-xs text-[#059669] font-bold">Verified Today</span>
            </div>
            <span className="text-[10px] text-[#475467] block mt-1">
              Crowdsourced queue calibrations
            </span>
          </div>
        </div>
      </div>

      {/* â”€â”€ "ATTENTION REQUIRED" SECTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              ATTENTION REQUIRED Â· OPERATIONAL CONGESTION ALERTS
            </h2>
            <span className="badge badge-critical text-[10px] py-0.5 px-2">
              {filteredAlerts.length} Flagged
            </span>
          </div>
          <span className="text-[11px] text-[#344054] font-medium">Automatic Threshold Triggers</span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAlerts.map(item => {
            const isDispatched = dispatchedActions[item.id]
            const isAck = acknowledgedAlerts[item.id]
            const isCritical = item.level === 'critical'

            return (
              <div
                key={item.id}
                className={`card p-5 bg-white border shadow-xs flex flex-col justify-between transition-all ${
                  isCritical ? 'border-l-4 border-l-red-600 border-slate-200' : 'border-l-4 border-l-orange-500 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-100 mb-3">
                    <div>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        isCritical ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {item.level.toUpperCase()} ANOMALY
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{item.office}</h3>
                    </div>
                    <span className="text-[11px] font-mono text-[#475467] font-semibold">{item.reportedAt}</span>
                  </div>

                  {/* Specific Required Alert Issue Description */}
                  <div className="p-2.5 rounded-lg bg-[#E8F0F8] border border-slate-200 mb-3">
                    <p className="text-xs font-bold text-slate-900 leading-snug">{item.issue}</p>
                    <span className="text-[10px] font-semibold text-[#344054] mt-1 block">Trend: {item.trend}</span>
                  </div>

                  {/* Telemetry numbers */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2 bg-[#E8F0F8] rounded border border-slate-200">
                      <span className="text-[9px] font-bold text-[#475467] uppercase block">Active In-Line</span>
                      <span className="text-base font-black text-slate-900 tabular-nums">{item.queueCount}</span>
                      <span className="text-[10px] text-[#344054] ml-1">citizens</span>
                    </div>
                    <div className="p-2 bg-[#E8F0F8] rounded border border-slate-200">
                      <span className="text-[9px] font-bold text-[#475467] uppercase block">Estimated Wait</span>
                      <span className="text-base font-black text-red-700 tabular-nums">{item.estWait}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#1D2939] mb-4 leading-relaxed">
                    <strong className="text-slate-800">Dispatch Protocol:</strong> {item.actionNeeded}
                  </p>
                </div>

                {/* Operations Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDeployRelief(item.id)}
                    disabled={isDispatched}
                    className={`btn-primary flex-1 py-1.5 text-xs font-bold justify-center ${
                      isDispatched ? 'bg-emerald-700 cursor-default' : ''
                    }`}
                  >
                    {isDispatched ? 'âœ“ Counter Deployed' : 'Deploy Relief Counter'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBroadcast(item.office)}
                    className="btn-secondary py-1.5 px-2.5 text-xs font-bold"
                    title="Broadcast delay advisory to citizen apps"
                  >
                    <Send className="h-3.5 w-3.5 text-[#1D2939]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAcknowledge(item.id)}
                    disabled={isAck}
                    className={`btn-secondary py-1.5 px-2.5 text-xs font-bold ${
                      isAck ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : ''
                    }`}
                    title="Acknowledge alert"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* â”€â”€ OFFICE MONITORING TABLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="card bg-white border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              OFFICE MONITORING TABLE Â· DISTRICT STATIONS
            </h2>
            <p className="text-xs text-[#344054] mt-0.5">
              Live status, wait estimates, counter utilization, and crowd trends across monitored offices
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] font-semibold text-[#344054]">Filter Scope:</span>
            <span className="bg-[#DCE7F2] text-slate-800 font-bold px-2 py-0.5 rounded border border-slate-200">
              {officeFilter === 'all' ? 'All 5 Offices' : offices.find(o => o.id === officeFilter)?.name || officeFilter}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#E8F0F8] border-b border-slate-200 text-[11px] font-bold text-[#344054] uppercase tracking-wider">
                <th className="py-3.5 px-6">Office</th>
                <th className="py-3.5 px-4 text-center">Queue</th>
                <th className="py-3.5 px-4 text-center">Wait</th>
                <th className="py-3.5 px-4 text-center">Crowd</th>
                <th className="py-3.5 px-4 text-center">Trend</th>
                <th className="py-3.5 px-6 text-right">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredTelemetry.map(row => {
                const badgeCfg = CROWD_BADGES[row.crowdLevel] || CROWD_BADGES.low

                return (
                  <tr key={row.id} className="hover:bg-[#E8F0F8]/80 transition-colors">
                    {/* Office */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-[#DCE7F2] border border-slate-200 text-slate-800 flex items-center justify-center font-bold shrink-0">
                          {row.id === 'rto' ? 'ðŸš—' : row.id === 'passport' ? 'âœˆï¸' : row.id === 'municipal' ? 'ðŸ™ï¸' : row.id === 'tehsil' ? 'ðŸ“‹' : 'ðŸ›ï¸'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm leading-tight">{row.name}</p>
                          <span className="text-[11px] text-[#475467] font-normal">{row.category}</span>
                        </div>
                      </div>
                    </td>

                    {/* Queue */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-black text-slate-900 text-base tabular-nums">
                        {row.queue}
                      </span>
                      <span className="text-[10px] text-[#475467] block font-semibold">citizens</span>
                    </td>

                    {/* Wait */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-slate-900 text-sm tabular-nums">
                        {row.wait}
                      </span>
                      <span className="text-[10px] text-[#475467] block font-normal">est. window</span>
                    </td>

                    {/* Crowd */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`${badgeCfg.badge} text-[10px] font-bold py-1 px-2.5`}>
                        {row.crowd}
                      </span>
                    </td>

                    {/* Trend */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1 font-bold">
                        <span className={`text-sm ${
                          row.trendDirection === 'up' ? 'text-red-600' :
                          row.trendDirection === 'down' ? 'text-emerald-600' : 'text-[#344054]'
                        }`}>
                          {row.trend}
                        </span>
                        <span className="text-[11px] text-[#1D2939] font-semibold">{row.trendText}</span>
                      </div>
                    </td>

                    {/* Last Updated */}
                    <td className="py-3.5 px-6 text-right font-medium text-[#344054] tabular-nums">
                      {row.lastUpdated}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* â”€â”€ 4 KEY OPERATIONS VISUALIZATIONS GRID â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">

        {/* 1. HOURLY QUEUE TREND CHART */}
        <div className="lg:col-span-7 card p-5 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <div className="flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-blue-900" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  HOURLY QUEUE TREND CHART
                </h3>
              </div>
              <p className="text-[11px] text-[#344054] mt-0.5">District queue surge curve from 09:00 AM to 05:00 PM</p>
            </div>
            <span className="text-[10px] font-bold bg-[#DCE7F2] text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              Capacity Limit: 40 citizens
            </span>
          </div>

          {/* Bar Chart Container */}
          <div className="relative pt-6">
            {/* 40 citizens baseline benchmark */}
            <div className="absolute top-16 left-0 right-0 border-b border-dashed border-red-300 z-0 pointer-events-none">
              <span className="absolute -top-4 right-0 text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                SLA Threshold: 40
              </span>
            </div>

            <div className="flex items-end gap-2 h-44 z-10 relative">
              {currentHourlyTrends.map(item => {
                const isOver = item.queue >= 40
                const barColor =
                  item.status === 'critical' ? 'bg-red-500' :
                  item.status === 'high' ? 'bg-orange-500' :
                  item.status === 'moderate' ? 'bg-blue-800' : 'bg-emerald-500'

                return (
                  <div key={item.time} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className={`text-[10px] font-bold tabular-nums ${isOver ? 'text-red-700' : 'text-slate-700'}`}>
                      {item.queue}
                    </span>
                    <div className="w-full flex items-end justify-center h-32 bg-[#DCE7F2]/70 rounded overflow-hidden">
                      <div
                        className={`w-full rounded-t transition-all duration-500 ${barColor} ${
                          item.isCurrent ? 'ring-2 ring-blue-900 ring-offset-1' : ''
                        }`}
                        style={{ height: `${item.pct}%` }}
                        title={`${item.time}: ${item.queue} in queue (~${item.wait}m wait)`}
                      />
                    </div>
                    <span className={`text-[10px] font-bold whitespace-nowrap ${
                      item.isCurrent ? 'text-blue-900 bg-blue-50 px-1 rounded' : 'text-[#344054]'
                    }`}>
                      {item.time.replace(':00', '')}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-[#344054]">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-900" />
              <strong>Current Period:</strong> 02:00 PM (~42 in queue, 68m wait)
            </span>
            <span>Recommended arrival: 01:00 PM or 04:30 PM</span>
          </div>
        </div>

        {/* 2. AVERAGE WAIT BY OFFICE */}
        <div className="lg:col-span-5 card p-5 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-emerald-800" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  AVERAGE WAIT BY OFFICE
                </h3>
              </div>
              <p className="text-[11px] text-[#344054] mt-0.5">Comparative waiting duration across all 5 centers</p>
            </div>
            <span className="text-[10px] font-bold text-[#475467]">Mean: 42 min</span>
          </div>

          <div className="space-y-3 pt-1">
            {analyticsData.officeTelemetry.map(row => {
              const maxWait = 80
              const pct = Math.min(100, (row.waitMinutes / maxWait) * 100)
              const barColor =
                row.crowdLevel === 'critical' ? 'bg-red-500' :
                row.crowdLevel === 'high' ? 'bg-orange-500' :
                row.crowdLevel === 'moderate' ? 'bg-amber-500' : 'bg-emerald-500'

              return (
                <div key={row.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800">{row.name}</span>
                    <span className="tabular-nums font-black text-slate-900">{row.wait}</span>
                  </div>
                  <div className="h-3 w-full bg-[#DCE7F2] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#475467]">
                    <span>{row.counters}</span>
                    <span>Status: {row.crowd}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-[#344054] flex items-center justify-between">
            <span>SLA Standard: &lt;35 min</span>
            <span className="text-red-700 font-bold">3 of 5 exceed standard</span>
          </div>
        </div>

        {/* 3. CROWD DISTRIBUTION */}
        <div className="lg:col-span-6 card p-5 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <div className="flex items-center gap-1.5">
                <PieChart className="h-4 w-4 text-blue-900" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  CROWD DISTRIBUTION
                </h3>
              </div>
              <p className="text-[11px] text-[#344054] mt-0.5">District-wide congestion breakdown by severity tier</p>
            </div>
            <span className="text-[10px] font-bold text-[#344054]">5 Monitored Centers</span>
          </div>

          {/* Segmented Multi-Tier Bar Meter */}
          <div className="space-y-4">
            <div className="h-4 w-full bg-[#DCE7F2] rounded-full overflow-hidden flex shadow-2xs">
              <div style={{ width: '20%' }} className="bg-red-500 h-full" title="Critical: 1 Office (20%)" />
              <div style={{ width: '40%' }} className="bg-orange-500 h-full" title="High: 2 Offices (40%)" />
              <div style={{ width: '20%' }} className="bg-amber-400 h-full" title="Moderate: 1 Office (20%)" />
              <div style={{ width: '20%' }} className="bg-emerald-500 h-full" title="Low: 1 Office (20%)" />
            </div>

            {/* Distribution Legend Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200/80 text-center">
                <span className="text-[10px] font-extrabold text-red-900 uppercase block">CRITICAL</span>
                <span className="text-lg font-black text-red-700 tabular-nums">1 (20%)</span>
                <span className="text-[10px] text-[#1D2939] block truncate">Passport Seva</span>
              </div>

              <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200/80 text-center">
                <span className="text-[10px] font-extrabold text-orange-900 uppercase block">HIGH</span>
                <span className="text-lg font-black text-orange-700 tabular-nums">2 (40%)</span>
                <span className="text-[10px] text-[#1D2939] block truncate">RTO & Tehsil</span>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/80 text-center">
                <span className="text-[10px] font-extrabold text-amber-900 uppercase block">MODERATE</span>
                <span className="text-lg font-black text-amber-700 tabular-nums">1 (20%)</span>
                <span className="text-[10px] text-[#1D2939] block truncate">Municipal Corp</span>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-center">
                <span className="text-[10px] font-extrabold text-emerald-900 uppercase block">LOW</span>
                <span className="text-lg font-black text-emerald-700 tabular-nums">1 (20%)</span>
                <span className="text-[10px] text-[#1D2939] block truncate">DM Office</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#E8F0F8] border border-slate-200 text-xs text-[#1D2939] leading-relaxed">
              <strong>District Operations Index:</strong> 60% of district administrative locations are currently operating above recommended counter capacity limits.
            </div>
          </div>
        </div>

        {/* 4. QUEUE ALERT LIST */}
        <div className="lg:col-span-6 card p-5 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <div className="flex items-center gap-1.5">
                <Bell className="h-4 w-4 text-orange-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  QUEUE ALERT LIST
                </h3>
              </div>
              <p className="text-[11px] text-[#344054] mt-0.5">Active automated threshold triggers & dispatch queue</p>
            </div>
            <span className="badge badge-high text-[10px] py-0.5 px-2">2 Pending Action</span>
          </div>

          <div className="space-y-3">
            {analyticsData.activeAlerts.map(alert => {
              const isAck = acknowledgedAlerts[alert.id]
              const isCritical = alert.severity === 'critical'

              return (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border text-xs transition-all ${
                    isCritical
                      ? 'bg-red-50/50 border-red-200'
                      : 'bg-orange-50/50 border-orange-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                        isCritical ? 'bg-red-600 text-white' : 'bg-orange-600 text-white'
                      }`}>
                        {alert.severity}
                      </span>
                      <strong className="text-slate-900 text-xs">{alert.office}</strong>
                    </div>
                    <span className="text-[10px] font-mono text-[#475467]">{alert.timestamp}</span>
                  </div>

                  <p className="text-slate-800 font-medium mb-2 leading-snug">{alert.message}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                    <span className="text-[#344054]">
                      Line: <strong className="text-slate-900">{alert.queue} citizens</strong> (Cap: {alert.threshold})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAcknowledge(alert.id)}
                      disabled={isAck}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded border transition-colors ${
                        isAck
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-[#DCE7F2]'
                      }`}
                    >
                      {isAck ? 'âœ“ Acknowledged' : 'Acknowledge'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#344054]">
            <span>Automated real-time threshold polling</span>
            <span className="text-emerald-700 font-semibold">Active monitor Â· Zero delay</span>
          </div>
        </div>

      </div>

      {/* Operational Footer Advisory */}
      <div className="p-3 bg-[#DCE7F2]/70 border border-slate-200/80 rounded-xl text-center text-[12px] text-[#344054]">
        <strong>Operational Advisory:</strong> Relief shifts should be staged at 10:00 AM across all major civic centers.
      </div>

    </div>
  )
}



