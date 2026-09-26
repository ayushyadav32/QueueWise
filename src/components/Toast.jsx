import { useState, useEffect } from 'react'
import { CheckCircle2, Info, AlertTriangle, Bell, X } from 'lucide-react'

const TYPE = {
  success: {
    icon: CheckCircle2,
    iconCls: 'text-emerald-700',
    cardCls: 'bg-white border-l-4 border-l-emerald-600 border-slate-200',
    bar: 'bg-emerald-600',
  },
  info: {
    icon: Info,
    iconCls: 'text-blue-800',
    cardCls: 'bg-white border-l-4 border-l-blue-800 border-slate-200',
    bar: 'bg-blue-800',
  },
  warning: {
    icon: AlertTriangle,
    iconCls: 'text-amber-700',
    cardCls: 'bg-white border-l-4 border-l-amber-500 border-slate-200',
    bar: 'bg-amber-500',
  },
  alert: {
    icon: Bell,
    iconCls: 'text-orange-700',
    cardCls: 'bg-white border-l-4 border-l-orange-500 border-slate-200',
    bar: 'bg-orange-500',
  },
}

export default function Toast({ message, type = 'info', onClose }) {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const cfg = TYPE[type] || TYPE.info
  const Icon = cfg.icon

  // Entrance transition
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  // Auto-dismiss after 4.5 seconds
  useEffect(() => {
    const t = setTimeout(() => dismiss(), 4500)
    return () => clearTimeout(t)
  }, [])

  const dismiss = () => {
    setLeaving(true)
    setTimeout(onClose, 250)
  }

  return (
    <div
      className={`relative w-full max-w-sm overflow-hidden rounded-xl border shadow-lg transition-all duration-200 ${cfg.cardCls} ${
        visible && !leaving ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-95'
      }`}
    >
      <div className="flex items-start gap-3 p-3.5">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${cfg.iconCls}`} />
        <p className="flex-1 text-xs font-semibold text-slate-900 leading-snug">{message}</p>
        <button
          onClick={dismiss}
          className="shrink-0 h-5 w-5 flex items-center justify-center rounded text-[#475467] hover:text-slate-700 transition-colors focus-ring"
          aria-label="Dismiss toast"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Progress bar countdown */}
      <div className="h-0.5 bg-[#DCE7F2]">
        <div
          className={`h-0.5 ${cfg.bar}`}
          style={{ animation: 'progress-shrink 4.5s linear forwards' }}
        />
      </div>
    </div>
  )
}


