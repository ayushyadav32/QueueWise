import { useState, useEffect, useRef } from 'react'
import {
  LayoutDashboard, Building2, BarChart3, Bell, Settings,
  Zap, ChevronRight, Home, LogOut, Search,
} from 'lucide-react'

const NAV = [
  { id: 'office',    icon: Home,            label: 'Home',      desc: 'Select office' },
  { id: 'analytics', icon: BarChart3,        label: 'Analytics', desc: 'Insights & trends' },
  { id: 'alerts',    icon: Bell,             label: 'Alerts',    desc: 'Notifications' },
]

export default function Sidebar({ step, selectedOffice, selectedService, onNavigate, onHome }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Map step to active nav item
  const active = step === 'analytics' ? 'analytics'
    : (step === 'dashboard' || step === 'service' || step === 'office') ? 'office'
    : 'office'

  return (
    <>
      {/* â”€â”€ Desktop sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <aside
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 bg-slate-900 border-r border-slate-800 transition-all duration-300 ${
          collapsed ? 'w-[68px]' : 'w-60'
        }`}
      >
        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-slate-800 px-4">
          <button
            onClick={onHome}
            className="flex items-center gap-2.5 group min-w-0"
            aria-label="QueueWise home"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20">
              <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            {!collapsed && (
              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-sm font-bold text-white truncate">QueueWise</span>
                <span className="text-[10px] text-[#344054] truncate">Skip the queue</span>
              </div>
            )}
          </button>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#1D2939] hover:bg-slate-800 hover:text-[#475467] transition-all"
              aria-label="Collapse sidebar"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="mb-3 mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-[#1D2939] hover:bg-slate-800 hover:text-[#475467] transition-all"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          {NAV.map((item) => {
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150 focus-ring ${
                  isActive
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'text-[#475467] hover:bg-slate-800 hover:text-slate-200'
                }`}
                aria-label={item.label}
              >
                {isActive && (
                  <span className="absolute left-0 inset-y-2 w-0.5 rounded-full bg-blue-500" />
                )}
                <item.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-[#344054] group-hover:text-slate-300'}`} />
                {!collapsed && (
                  <div className="flex flex-col items-start leading-tight min-w-0">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-[10px] text-[#1D2939]">{item.desc}</span>
                  </div>
                )}
              </button>
            )
          })}
        </nav>

        {/* Context card (shows selected office/service) */}
        {!collapsed && selectedOffice && (
          <div className="mx-3 mb-3 rounded-xl border border-slate-700/60 bg-slate-800/60 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1D2939] mb-1.5">Current selection</p>
            <div className="flex items-center gap-2">
              <span className="text-lg leading-none">{selectedOffice.emoji}</span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{selectedOffice.name}</p>
                {selectedService && (
                  <p className="text-[10px] text-[#344054] truncate">{selectedService.name}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* User section */}
        <div className={`border-t border-slate-800 p-3 ${collapsed ? 'flex justify-center' : ''}`}>
          {collapsed ? (
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
              U
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
                U
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">Citizen User</p>
                <p className="text-[10px] text-[#344054]">Lucknow, UP</p>
              </div>
              <button className="h-7 w-7 flex items-center justify-center rounded-lg text-[#1D2939] hover:bg-slate-700 hover:text-[#475467] transition-all">
                <Settings className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* â”€â”€ Mobile bottom tab bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800">
        <div className="flex items-stretch">
          {/* Home tab */}
          <button
            onClick={onHome}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
              step === 'landing' ? 'text-blue-400' : 'text-[#344054] hover:text-slate-300'
            }`}
          >
            <Home className="h-5 w-5" />
            Home
          </button>

          {NAV.map((item) => {
            const isActive = active === item.id && step !== 'landing'
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-blue-400' : 'text-[#344054] hover:text-slate-300'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}


