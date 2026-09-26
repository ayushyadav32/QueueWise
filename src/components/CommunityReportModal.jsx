import { useState, useEffect } from 'react'
import {
  Users, Clock, Activity, MessageSquarePlus, X, Check,
  AlertTriangle, ShieldCheck, Info, RefreshCw
} from 'lucide-react'

const COOLDOWN_SECONDS = 60

export default function CommunityReportModal({ office, onClose, onSubmit, showToast }) {
  const [waitingRange, setWaitingRange] = useState('11â€“25')
  const [estimatedWait, setEstimatedWait] = useState('15â€“30 min')
  const [crowdCondition, setCrowdCondition] = useState('Moderate')
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)

  // Check duplicate submission cooldown for this office
  useEffect(() => {
    try {
      const lastTimeStr = localStorage.getItem(`queuewise_last_report_${office.id}`)
      if (lastTimeStr) {
        const lastTime = parseInt(lastTimeStr, 10)
        const elapsedSec = Math.floor((Date.now() - lastTime) / 1000)
        if (elapsedSec < COOLDOWN_SECONDS) {
          setCooldownRemaining(COOLDOWN_SECONDS - elapsedSec)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }, [office.id])

  // Cooldown countdown interval
  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setInterval(() => {
        setCooldownRemaining(prev => Math.max(0, prev - 1))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [cooldownRemaining])

  const handleResetCooldown = () => {
    try {
      localStorage.removeItem(`queuewise_last_report_${office.id}`)
      setCooldownRemaining(0)
      if (showToast) showToast('Cooldown reset for demonstration.', 'info')
    } catch (e) {
      console.error(e)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (cooldownRemaining > 0) return

    const now = Date.now()
    const reportData = {
      id: `rep-${now}`,
      officeId: office.id,
      waitingRange,
      estimatedWait,
      crowdCondition,
      note: note.trim() || undefined,
      ago: 'Just now',
      timestamp: now,
      votes: 1,
    }

    // Persist to localStorage
    try {
      localStorage.setItem(`queuewise_last_report_${office.id}`, now.toString())
      const storedReports = JSON.parse(localStorage.getItem('queuewise_community_reports') || '[]')
      localStorage.setItem('queuewise_community_reports', JSON.stringify([reportData, ...storedReports]))
    } catch (err) {
      console.error('Error saving community report to localStorage:', err)
    }

    setSubmitted(true)
    setTimeout(() => {
      onSubmit(reportData)
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs anim-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 anim-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-[#E8F0F8]/50">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-[#344054] uppercase tracking-widest block">
                CIVIC REPORTING SYSTEM
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Report Current Queue Â· {office.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200/70 text-[#475467] hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Cooldown Prevention Banner */}
            {cooldownRemaining > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Duplicate Submission Protection Active</p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      You recently submitted an update for this center. Please wait <strong>{cooldownRemaining}s</strong> before submitting again.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResetCooldown}
                  className="text-[10px] font-bold text-blue-900 hover:underline shrink-0 bg-white border border-amber-300 px-2 py-1 rounded"
                >
                  Bypass (Demo)
                </button>
              </div>
            )}

            {/* Input 1: Number of people waiting */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Number of People Waiting
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['0â€“10', '11â€“25', '26â€“50', '50+'].map(range => (
                  <button
                    type="button"
                    key={range}
                    onClick={() => setWaitingRange(range)}
                    className={`py-2 px-2 rounded-lg border text-xs font-bold transition-all ${
                      waitingRange === range
                        ? 'bg-blue-900 border-blue-900 text-white shadow-xs'
                        : 'bg-[#E8F0F8] border-slate-200 text-slate-700 hover:bg-[#DCE7F2]'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Input 2: Estimated waiting time */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. Estimated Waiting Time
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Under 15 min', '15â€“30 min', '30â€“60 min', '60+ min'].map(wait => (
                  <button
                    type="button"
                    key={wait}
                    onClick={() => setEstimatedWait(wait)}
                    className={`py-2 px-2 rounded-lg border text-xs font-bold transition-all ${
                      estimatedWait === wait
                        ? 'bg-blue-900 border-blue-900 text-white shadow-xs'
                        : 'bg-[#E8F0F8] border-slate-200 text-slate-700 hover:bg-[#DCE7F2]'
                    }`}
                  >
                    {wait}
                  </button>
                ))}
              </div>
            </div>

            {/* Input 3: Crowd condition */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                3. Crowd Condition
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Low', color: 'hover:border-emerald-400' },
                  { label: 'Moderate', color: 'hover:border-amber-400' },
                  { label: 'High', color: 'hover:border-orange-400' },
                  { label: 'Very High', color: 'hover:border-red-400' },
                ].map(cond => (
                  <button
                    type="button"
                    key={cond.label}
                    onClick={() => setCrowdCondition(cond.label)}
                    className={`py-2 px-2 rounded-lg border text-xs font-bold transition-all ${
                      crowdCondition === cond.label
                        ? 'bg-blue-900 border-blue-900 text-white shadow-xs'
                        : `bg-[#E8F0F8] border-slate-200 text-slate-700 hover:bg-[#DCE7F2] ${cond.color}`
                    }`}
                  >
                    {cond.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Note / Observation (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Counter 3 moving fast, token machine online"
                value={note}
                onChange={e => setNote(e.target.value)}
                className="form-input text-xs"
              />
            </div>

            {/* Transparency Disclaimer */}
            <div className="p-3 bg-[#E8F0F8] border border-slate-200 rounded-lg text-[11px] text-[#344054] leading-snug">
              <span className="font-semibold text-slate-700">Citizen Transparency:</span> Community reported data calibrates public wait forecasts. Reports do not represent official government declarations.
            </div>

            {/* Buttons */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1 py-2.5 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={cooldownRemaining > 0}
                className="btn-primary flex-1 py-2.5 text-xs font-bold shadow-sm"
              >
                Submit Update
              </button>
            </div>
          </form>
        ) : (
          <div className="p-8 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto text-xl font-bold">
              âœ“
            </div>
            <h4 className="text-base font-bold text-slate-900">Community Report Logged</h4>
            <p className="text-xs text-[#1D2939] max-w-sm mx-auto">
              "Thanks â€” your report updated the live queue estimate and arrival recommendation for fellow citizens."
            </p>
          </div>
        )}
      </div>
    </div>
  )
}


