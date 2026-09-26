import { offices, analyticsData, getQueueStatus } from '../data/mockData'
import { calculateQueuePrediction } from '../utils/predictionEngine'
import { MapPin, Clock, ChevronRight, Search, ShieldCheck } from 'lucide-react'
import { useState, useMemo } from 'react'

const S = {
  low:      { badge: 'badge badge-low',      label: 'Low'      },
  moderate: { badge: 'badge badge-moderate', label: 'Moderate' },
  high:     { badge: 'badge badge-high',     label: 'High'     },
  critical: { badge: 'badge badge-critical', label: 'Critical' },
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1,2,3,4,5].map(n => (
          <svg key={n} className={`h-3 w-3 ${n <= Math.round(rating) ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-xs text-[#344054] font-medium">{rating}</span>
    </div>
  )
}

export default function OfficeSelector({ onSelect }) {
  const [searchTerm, setSearchTerm] = useState('')

  const snap = useMemo(() => {
    return Object.fromEntries(
      offices.map(o => {
        const pred = calculateQueuePrediction({ officeId: o.id, date: new Date() })
        return [
          o.id,
          {
            count: pred.count,
            wait: pred.wait,
            isOpen: pred.isOpen,
            status: pred.status,
            capacityPct: pred.capacityPct,
          },
        ]
      })
    )
  }, [])

  const filtered = offices.filter(o =>
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="journey-step-tag">1. Destination</span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">WHERE ARE YOU GOING?</h1>
          <p className="mt-0.5 text-xs text-[#344054]">
            Select a verified government department center to inspect real-time line occupancy.
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <Search className="h-4 w-4 text-[#475467] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by office or serviceâ€¦"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="form-input pl-9 text-xs"
          />
        </div>
      </div>

      {/* Office Table Grid */}
      <div className="card overflow-hidden bg-white border-slate-200 shadow-sm">
        {/* Table Column Headers */}
        <div className="grid grid-cols-12 items-center gap-4 bg-[#E8F0F8] border-b border-slate-200 px-6 py-3 text-[11px] font-bold text-[#344054] uppercase tracking-wider">
          <div className="col-span-5">Government Center</div>
          <div className="col-span-2 text-center hidden sm:block">Current Queue</div>
          <div className="col-span-2 text-center hidden md:block">Est. Wait</div>
          <div className="col-span-2 hidden lg:block">Crowd Status</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {filtered.map((office, i) => {
          const s = snap[office.id]
          const qs = s ? getQueueStatus(s.count) : null
          const cfg = qs ? S[qs.level] : null

          return (
            <button
              key={office.id}
              onClick={() => onSelect(office)}
              className={`w-full grid grid-cols-12 items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-[#E8F0F8]/80 focus-ring cursor-pointer ${
                i < filtered.length - 1 ? 'border-b border-slate-100' : ''
              }`}
            >
              {/* Office Details */}
              <div className="col-span-11 sm:col-span-5 flex items-center gap-3.5 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#DCE7F2] border border-slate-200 text-2xl">
                  {office.emoji}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 truncate">{office.name}</p>
                    <span className="text-[10px] font-bold bg-[#DCE7F2] text-[#1D2939] px-1.5 py-0.2 rounded border border-slate-200">
                      {office.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#344054] truncate mt-0.5">{office.address}, {office.city}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={office.rating} />
                    <span className="text-[10px] text-[#475467]">({office.totalReviews} visits logged)</span>
                  </div>
                </div>
              </div>

              {/* Queue Number */}
              <div className="col-span-2 text-center hidden sm:block">
                {s?.isOpen ? (
                  <div>
                    <span className="text-2xl font-extrabold text-slate-900 tabular-nums">{s.count}</span>
                    <span className="text-[10px] text-[#475467] block font-medium">waiting in line</span>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-[#475467]">Closed Today</span>
                )}
              </div>

              {/* Wait */}
              <div className="col-span-2 text-center hidden md:block">
                {s?.isOpen && qs ? (
                  <div>
                    <span className="text-base font-bold text-slate-800 tabular-nums">
                      ~{s.wait} min
                    </span>
                    <span className="text-[10px] text-[#475467] block font-medium">projected delay</span>
                  </div>
                ) : 'â€”'}
              </div>

              {/* Status Badge */}
              <div className="col-span-2 hidden lg:block">
                {cfg ? <span className={cfg.badge}>{cfg.label} Congestion</span> : 'â€”'}
              </div>

              {/* Select Chevron */}
              <div className="col-span-1 flex justify-end">
                <span className="h-8 w-8 rounded-lg bg-[#DCE7F2] text-[#1D2939] hover:bg-blue-900 hover:text-white flex items-center justify-center transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="p-4 bg-[#E8F0F8] rounded-xl border border-slate-200 flex items-center justify-between text-xs text-[#344054]">
        <span className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Verified telemetry from Lucknow District Public Service Division
        </span>
        <span className="font-semibold text-slate-700">All data public and open</span>
      </div>
    </div>
  )
}


