import { useState, useRef, useEffect } from 'react'
import {
  Bell,
  Menu,
  X,
  User,
  LogOut,
  Calendar,
  History,
  CheckCheck,
  Trash2,
  ChevronDown,
  Building2,
  Clock,
  ArrowRight,
} from 'lucide-react'

export default function Navbar({
  step,
  onNavigate,
  onHome,
  savedVisitsCount = 0,
  notifications = [],
  currentUser = null,
  onOpenAuth,
  onLogout,
  onOpenProfile,
  onNavigateHistory,
  onMarkAllAsRead,
  onMarkAsRead,
  onClearNotifications,
  onDeleteNotification,
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const notifRef = useRef(null)
  const profileRef = useRef(null)

  const unreadCount = notifications.filter(n => !n.read).length

  // Click outside listener for notifications and profile popovers
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }
    if (showNotifications || showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications, showProfileMenu])

  const userInitials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .filter(Boolean)
        .map(w => w[0].toUpperCase())
        .slice(0, 2)
        .join('')
    : 'QW'

  const firstName = currentUser?.name ? currentUser.name.trim().split(' ')[0] : 'Citizen'

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E4E7EC]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* ── Left: Brand Logo ────────────────────────────────────── */}
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={onHome}
              className="flex items-center gap-2.5 focus-ring rounded-lg p-1 -ml-1 text-left"
            >
              <div className="h-9 w-9 rounded-lg bg-[#0B5CAD] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                QW
              </div>
              <div>
                <span className="text-base font-bold text-[#172033] tracking-tight block leading-tight">
                  QueueWise
                </span>
                <span className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider block">
                  Civic Queue Portal
                </span>
              </div>
            </button>

            {/* ── Primary Top Navigation Links ──────────────────────── */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                type="button"
                onClick={onHome}
                className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                  step === 'landing'
                    ? 'text-[#0B5CAD] bg-[#EFF6FC]'
                    : 'text-[#667085] hover:text-[#172033] hover:bg-slate-50'
                }`}
              >
                Home
              </button>

              <button
                type="button"
                onClick={() => onNavigate('office')}
                className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                  step === 'office' || step === 'service' || step === 'dashboard'
                    ? 'text-[#0B5CAD] bg-[#EFF6FC]'
                    : 'text-[#667085] hover:text-[#172033] hover:bg-slate-50'
                }`}
              >
                Find Services
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!currentUser) {
                    onOpenAuth({
                      mode: 'login',
                      title: 'Create your free QueueWise account',
                      subtitle: 'Save visits, track your history, and get personalized queue alerts.',
                      onPostAuth: () => onNavigate('my-visits')
                    })
                  } else {
                    onNavigate('my-visits')
                  }
                }}
                className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                  step === 'my-visits'
                    ? 'text-[#0B5CAD] bg-[#EFF6FC]'
                    : 'text-[#667085] hover:text-[#172033] hover:bg-slate-50'
                }`}
              >
                <span>My Visits</span>
                {savedVisitsCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-[#0B5CAD] text-white">
                    {savedVisitsCount}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* ── Right Side: Notifications & Profile ──────────────────── */}
          <div className="flex items-center gap-3">

            {/* Notifications Popover */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => {
                  if (!currentUser) {
                    onOpenAuth({
                      mode: 'register',
                      title: 'Create your free QueueWise account',
                      subtitle: 'Save visits, track your history, and get personalized queue alerts.',
                      onPostAuth: () => setShowNotifications(true)
                    })
                    return
                  }
                  setShowNotifications(v => !v)
                }}
                className="relative p-2 rounded-md text-[#667085] hover:text-[#172033] hover:bg-slate-100 transition-colors focus-ring"
                aria-label="View notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#DC2626] ring-2 ring-white" />
                )}
              </button>

              {/* Notification Center Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg border border-[#E4E7EC] shadow-lg anim-scale-in overflow-hidden z-50">
                  <div className="px-4 py-3 bg-[#F9FAFB] border-b border-[#E4E7EC] flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                        Civic Notifications
                      </h3>
                      <p className="text-[11px] text-[#667085]">
                        {unreadCount > 0 ? `${unreadCount} unread update(s)` : 'All caught up'}
                      </p>
                    </div>
                    {unreadCount > 0 && onMarkAllAsRead && (
                      <button
                        type="button"
                        onClick={onMarkAllAsRead}
                        className="text-[11px] font-semibold text-[#0B5CAD] hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-[#E4E7EC]">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[#667085]">
                        No active alerts or queue notifications.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3.5 transition-colors flex items-start justify-between gap-3 ${
                            notif.read ? 'bg-white' : 'bg-[#EFF6FC]/40'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              {!notif.read && (
                                <span className="h-1.5 w-1.5 rounded-full bg-[#0B5CAD] shrink-0" />
                              )}
                              <h4 className="text-xs font-bold text-[#172033] truncate">
                                {notif.title}
                              </h4>
                            </div>
                            <p className="text-[11px] text-[#172033] font-medium mt-0.5">
                              {notif.officeName}
                            </p>
                            <p className="text-[11px] text-[#667085] mt-0.5">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-[#667085] mt-1 block">
                              {notif.timeAgo || 'Recently'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {!notif.read && onMarkAsRead && (
                              <button
                                type="button"
                                onClick={() => onMarkAsRead(notif.id)}
                                className="p-1 text-[#667085] hover:text-[#0B5CAD] rounded"
                                title="Mark read"
                              >
                                <CheckCheck className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {onDeleteNotification && (
                              <button
                                type="button"
                                onClick={() => onDeleteNotification(notif.id)}
                                className="p-1 text-[#667085] hover:text-[#DC2626] rounded"
                                title="Dismiss"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {notifications.length > 0 && onClearNotifications && (
                    <div className="p-2.5 bg-[#F9FAFB] border-t border-[#E4E7EC] text-center">
                      <button
                        type="button"
                        onClick={onClearNotifications}
                        className="text-xs font-semibold text-[#667085] hover:text-[#172033]"
                      >
                        Clear all notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Dropdown / Auth Actions */}
            {currentUser ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(v => !v)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-[#E4E7EC] hover:bg-slate-50 transition-colors focus-ring"
                >
                  <div className="h-7 w-7 rounded-md bg-[#0B5CAD] text-white flex items-center justify-center font-bold text-xs">
                    {userInitials}
                  </div>
                  <span className="text-xs font-semibold text-[#172033] hidden sm:inline">
                    {firstName}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-[#667085]" />
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-[#E4E7EC] shadow-lg anim-scale-in py-1 z-50">
                    <div className="px-4 py-2.5 border-b border-[#E4E7EC]">
                      <p className="text-xs font-bold text-[#172033]">{currentUser.name}</p>
                      <p className="text-[11px] text-[#667085] truncate">{currentUser.email}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false)
                        onNavigate('my-visits')
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-[#172033] hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4 text-[#667085]" />
                      <span>My Visits & Passes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false)
                        if (onNavigateHistory) onNavigateHistory()
                        else onNavigate('history')
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-[#172033] hover:bg-slate-50 flex items-center gap-2"
                    >
                      <History className="h-4 w-4 text-[#667085]" />
                      <span>Activity History</span>
                    </button>

                    <div className="border-t border-[#E4E7EC] my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false)
                        onLogout()
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-[#DC2626] hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-1.5 text-xs font-semibold text-[#172033] hover:text-[#0B5CAD] transition-colors"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="btn-primary py-1.5 px-3.5 text-xs font-bold shadow-xs"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden p-2 rounded-md text-[#667085] hover:text-[#172033] hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="md:hidden py-3 border-t border-[#E4E7EC] space-y-1">
            <button
              type="button"
              onClick={() => { setMobileOpen(false); onHome(); }}
              className="w-full px-3 py-2 text-left text-sm font-semibold text-[#172033] hover:bg-slate-50 rounded-md"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => { setMobileOpen(false); onNavigate('office'); }}
              className="w-full px-3 py-2 text-left text-sm font-semibold text-[#172033] hover:bg-slate-50 rounded-md"
            >
              Find Services
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false)
                if (!currentUser) {
                  onOpenAuth({
                    mode: 'login',
                    title: 'Create your free QueueWise account',
                    subtitle: 'Save visits, track your history, and get personalized queue alerts.',
                    onPostAuth: () => onNavigate('my-visits')
                  })
                } else {
                  onNavigate('my-visits')
                }
              }}
              className="w-full px-3 py-2 text-left text-sm font-semibold text-[#172033] hover:bg-slate-50 rounded-md flex items-center justify-between"
            >
              <span>My Visits</span>
              {savedVisitsCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-[#0B5CAD] text-white">
                  {savedVisitsCount}
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
