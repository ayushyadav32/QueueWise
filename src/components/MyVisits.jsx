import { useState } from 'react'
import {
  Calendar, Clock, MapPin, CheckCheck, Printer, Trash2,
  AlertCircle, ArrowRight, ShieldCheck, Bell, Plus, Sparkles
} from 'lucide-react'

export default function MyVisits({
  visits = [],
  historyVisits = [],
  currentUser = null,
  initialTab = 'active',
  onRemoveVisit,
  onToggleReminder,
  onUpdateVisit,
  onSimulateVisitAlert,
  onArchiveVisit,
  onPlanNew,
  showToast,
}) {
  const [activeTab, setActiveTab] = useState(initialTab) // 'active' | 'history'

  const handleToggle = (id) => {
    if (onToggleReminder) {
      onToggleReminder(id)
    }
  }

  const displayedVisits = activeTab === 'active' ? visits : historyVisits

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="journey-step-tag">Citizen Portfolio</span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">My Saved Visit Plans</h1>
          <p className="text-xs text-[#344054] mt-0.5">
            {currentUser ? `Personalized citizen portfolio for ${currentUser.name}` : 'Your verified civic visit passes, document preparation checklists, and timed arrival slots.'} (Stored locally in browser).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active vs History Tab Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-lg text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'active'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-[#1D2939] hover:text-slate-900'
              }`}
            >
              Active Passes ({visits.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-[#1D2939] hover:text-slate-900'
              }`}
            >
              History ({historyVisits.length})
            </button>
          </div>

          <button
            onClick={onPlanNew}
            className="btn-primary py-2 px-4 text-xs font-bold shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Plan Another Visit
          </button>
        </div>
      </div>

      {/* Empty State */}
      {displayedVisits.length === 0 ? (
        activeTab === 'active' ? (
          <div className="card p-12 text-center bg-white border-slate-200 max-w-lg mx-auto anim-scale-up">
            <div className="h-14 w-14 rounded-full bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-center mx-auto text-2xl font-bold mb-4">
              ðŸŽ«
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#DCE7F2] text-slate-700 text-xs font-semibold mb-3">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Verified Citizen Profile</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Welcome, {currentUser?.name || 'Citizen'}
            </h2>
            <p className="text-sm font-semibold text-[#1D2939] mt-1">
              No visits planned yet.
            </p>
            <p className="text-xs text-[#344054] mt-2 max-w-sm mx-auto leading-relaxed">
              Your personalized visit portfolio is ready. Plan your visit to check real-time queues, match required documents, and get the lowest-crowd arrival time slot.
            </p>
            <button
              onClick={onPlanNew}
              className="btn-primary mt-6 py-2.5 px-5 text-xs font-bold mx-auto shadow-xs"
            >
              <Plus className="h-4 w-4" />
              Plan your first government visit
            </button>
          </div>
        ) : (
          <div className="card p-12 text-center bg-white border-slate-200 max-w-lg mx-auto anim-scale-up">
            <div className="h-14 w-14 rounded-full bg-[#DCE7F2] border border-slate-200 text-[#344054] flex items-center justify-center mx-auto text-2xl font-bold mb-4">
              <Clock className="h-6 w-6 text-[#475467]" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              No Completed Visits in History
            </h2>
            <p className="text-xs text-[#344054] mt-1.5 max-w-sm mx-auto leading-relaxed">
              When you complete a scheduled civic visit, mark it as completed to archive your official receipt and document checklist here.
            </p>
            <button
              onClick={() => setActiveTab('active')}
              className="btn-secondary mt-5 py-2 px-4 text-xs font-bold mx-auto"
            >
              View Active Passes
            </button>
          </div>
        )
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {displayedVisits.map(pass => {
            const isReminderOn = pass.reminderActive !== false
            const isQueueAlertOn = pass.queueAlertActive !== false
            const isHistory = activeTab === 'history'

            return (
              <div key={pass.id} className="civic-pass">
                {/* Pass Header */}
                <div className={`civic-pass-header flex items-center justify-between ${isHistory ? 'bg-slate-800' : ''}`}>
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-300 block">
                      {isHistory ? 'ARCHIVED CIVIC VISIT RECORD Â· COMPLETED' : 'CIVIC APPOINTMENT & VISIT ADVISORY PASS'}
                    </span>
                    <h3 className="text-base font-bold text-white tracking-wide mt-0.5">{pass.serviceName}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-[#475467] uppercase tracking-widest block">PASS ID</span>
                    <span className="text-xs font-mono font-bold text-blue-300">{pass.id}</span>
                  </div>
                </div>

                {/* Pass Details */}
                <div className="p-6 bg-white space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                    <span className="text-[#344054] font-medium">Registered Citizen:</span>
                    <strong className="text-slate-900">{pass.citizenName || currentUser?.name || 'Citizen'}</strong>
                  </div>

                  <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-[#475467] uppercase tracking-wider block">Office Location</span>
                      <p className="text-sm font-bold text-slate-900">{pass.officeName}</p>
                      <p className="text-xs text-[#344054] mt-0.5">Lucknow Central Hub</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-[#475467] uppercase tracking-wider block">Recommended Arrival</span>
                      <p className="text-sm font-bold text-blue-900">{pass.recommendedSlot}</p>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-1 inline-block">
                        Lowest Crowd Period
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#E8F0F8] p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[9px] font-bold text-[#475467] uppercase tracking-wider block">Expected Wait</span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{pass.expectedWait}</p>
                      <span className="text-[10px] text-[#344054]">Based on 90-day AI data</span>
                    </div>

                    <div className="bg-[#E8F0F8] p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[9px] font-bold text-[#475467] uppercase tracking-wider block">Document Readiness</span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{pass.docsReady}</p>
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCheck className="h-3 w-3" /> Verified Checklist
                      </span>
                    </div>
                  </div>

                  {/* Notification & Reminder Preferences Box */}
                  <div className="p-3.5 rounded-xl bg-[#E8F0F8] border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-1.5">
                        <Bell className="h-3.5 w-3.5 text-blue-800" />
                        <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                          Visit Reminder & Queue Alert
                        </span>
                      </div>
                      <span className="text-[10px] text-[#475467] font-semibold">Local state</span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 items-center">
                      {/* Reminder Enabled & Timing */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${isReminderOn ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            Visit Reminder
                          </label>
                          <button
                            type="button"
                            onClick={() => onUpdateVisit && onUpdateVisit(pass.id, { reminderActive: !isReminderOn })}
                            className={`text-[11px] font-bold px-2 py-0.5 rounded border transition-colors ${
                              isReminderOn
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                : 'bg-white border-slate-300 text-[#344054] hover:bg-[#DCE7F2]'
                            }`}
                          >
                            {isReminderOn ? 'Enabled âœ“' : 'Disabled'}
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-[#344054] font-medium">Timing:</span>
                          <select
                            value={pass.reminderTime || '1 hour before'}
                            disabled={!isReminderOn}
                            onChange={(e) => onUpdateVisit && onUpdateVisit(pass.id, { reminderTime: e.target.value })}
                            className="text-xs font-semibold bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 focus-ring disabled:opacity-50 cursor-pointer w-full"
                          >
                            <option value="15 min before">15 min before</option>
                            <option value="30 min before">30 min before</option>
                            <option value="1 hour before">1 hour before (Recommended)</option>
                            <option value="2 hours before">2 hours before</option>
                            <option value="Morning of visit (08:00 AM)">Morning of visit (08:00 AM)</option>
                          </select>
                        </div>
                      </div>

                      {/* Queue Alert Enabled */}
                      <div className="space-y-1.5 sm:border-l sm:border-slate-200 sm:pl-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${isQueueAlertOn ? 'bg-blue-600' : 'bg-slate-300'}`} />
                            Queue Drop Alert
                          </label>
                          <button
                            type="button"
                            onClick={() => onUpdateVisit && onUpdateVisit(pass.id, { queueAlertActive: !isQueueAlertOn })}
                            className={`text-[11px] font-bold px-2 py-0.5 rounded border transition-colors ${
                              isQueueAlertOn
                                ? 'bg-blue-50 border-blue-300 text-blue-900'
                                : 'bg-white border-slate-300 text-[#344054] hover:bg-[#DCE7F2]'
                            }`}
                          >
                            {isQueueAlertOn ? 'Active âš¡' : 'Disabled'}
                          </button>
                        </div>
                        <p className="text-[10px] text-[#344054] leading-snug">
                          Alerts you if the queue at {pass.officeName} becomes shorter before arrival.
                        </p>
                      </div>
                    </div>

                    {/* Test alert trigger for Hackathon judges */}
                    {onSimulateVisitAlert && (
                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                        <span className="text-[10px] text-[#344054] font-semibold">Demo queue alert:</span>
                        <button
                          type="button"
                          onClick={() => onSimulateVisitAlert(pass)}
                          className="text-[11px] font-bold text-blue-900 bg-white hover:bg-blue-50 border border-blue-200 px-2.5 py-1 rounded transition-colors flex items-center gap-1"
                        >
                          <Sparkles className="h-3 w-3 text-blue-600" />
                          Test Drop Notification
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Perforated Divider */}
                  <div className="civic-pass-perforation" />

                  {/* Barcode & Security Elements */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <p className="text-[10px] font-mono text-[#344054]">ISSUED: {pass.savedAt || 'Today'}</p>
                      <p className="text-[9px] text-[#475467]">OFFICIAL GOVERNMENT OF UP DIGITAL RECEIPT Â· LOCALSTORAGE ACTIVE</p>
                    </div>

                    <div className="flex gap-0.5 h-6 items-center opacity-70">
                      {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2].map((w, i) => (
                        <span
                          key={i}
                          className="bg-slate-800 h-full inline-block"
                          style={{ width: `${w}px` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    {activeTab === 'active' && onArchiveVisit && (
                      <button
                        type="button"
                        onClick={() => onArchiveVisit(pass)}
                        className="btn-secondary py-1.5 px-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
                        title="Archive as completed visit"
                      >
                        âœ“ Completed
                      </button>
                    )}
                    <button
                      onClick={() => handleToggle(pass.id)}
                      className={`btn-secondary flex-1 py-1.5 text-xs font-bold justify-center ${
                        isReminderOn ? 'bg-blue-50 text-blue-900 border-blue-300' : 'text-[#344054]'
                      }`}
                    >
                      <Bell className="h-3.5 w-3.5" />
                      {isReminderOn ? 'Reminder Active âœ“' : 'Enable Reminder'}
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="btn-secondary py-1.5 px-3 text-xs font-bold"
                      title="Print Pass"
                    >
                      <Printer className="h-3.5 w-3.5 text-[#1D2939]" />
                    </button>
                    <button
                      onClick={() => onRemoveVisit && onRemoveVisit(pass.id)}
                      className="p-2 text-[#475467] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete saved pass"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}


