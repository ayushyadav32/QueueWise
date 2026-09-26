import { services } from '../data/mockData'
import { Clock, FileText, ChevronRight, Info, ShieldCheck } from 'lucide-react'

export default function ServiceSelector({ office, onSelect }) {
  const list = services[office.id] || []

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <span className="journey-step-tag">2. Service Selection</span>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">WHAT DO YOU NEED?</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Select the exact service you require at <strong className="text-slate-800">{office.fullName}</strong>.
        </p>
      </div>

      {/* Office Context Pill */}
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <span className="text-3xl p-1.5 bg-slate-100 rounded-lg">{office.emoji}</span>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">SELECTED OFFICE</span>
          <p className="text-sm font-bold text-slate-900">{office.fullName}</p>
          <p className="text-xs text-slate-500">{office.timings} · {office.address}</p>
        </div>
      </div>

      {/* Service List as Modern Information Table */}
      <div className="card overflow-hidden bg-white border-slate-200 shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 grid grid-cols-12 gap-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <div className="col-span-7 sm:col-span-6">Official Public Service</div>
          <div className="col-span-2 text-center hidden sm:block">Avg. Counter Time</div>
          <div className="col-span-2 text-center hidden md:block">Verified Documents</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {list.map((svc, i) => (
          <button
            key={svc.id}
            onClick={() => onSelect(svc)}
            className={`w-full grid grid-cols-12 items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-slate-50/80 focus-ring cursor-pointer ${
              i < list.length - 1 ? 'border-b border-slate-100' : ''
            }`}
          >
            <div className="col-span-11 sm:col-span-6 min-w-0">
              <p className="text-sm font-bold text-slate-900">{svc.name}</p>
              <p className="text-xs text-slate-500 mt-0.5 truncate">{svc.description}</p>
              {/* Mobile Chips */}
              <div className="flex items-center gap-3 mt-1.5 sm:hidden">
                <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                  <Clock className="h-3 w-3" />~{svc.avgTime} min
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                  <FileText className="h-3 w-3" />{svc.documents.length} docs
                </span>
              </div>
            </div>

            <div className="hidden sm:flex col-span-2 justify-center">
              <span className="text-sm font-bold text-slate-800 tabular-nums">~{svc.avgTime} min</span>
            </div>

            <div className="hidden md:flex col-span-2 justify-center">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-md px-2.5 py-1">
                <FileText className="h-3.5 w-3.5 text-slate-500" />
                {svc.documents.length} Items Required
              </span>
            </div>

            <div className="col-span-1 flex justify-end">
              <span className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-900 hover:text-white flex items-center justify-center transition-colors">
                <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Helpful Civic Note */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
        <Info className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 leading-relaxed">
          <strong>Citizen Notice:</strong> Each service carries a customized statutory checklist. Choosing your exact service ensures you do not travel with missing or incomplete documentation.
        </p>
      </div>
    </div>
  )
}
