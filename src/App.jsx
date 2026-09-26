import { useState, useCallback, useEffect } from 'react'
import Navbar from './components/Navbar'
import LandingHero from './components/LandingHero'
import OfficeSelector from './components/OfficeSelector'
import ServiceSelector from './components/ServiceSelector'
import QueueDashboard from './components/QueueDashboard'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import PlanVisitWizard from './components/PlanVisitWizard'
import UserDashboard from './components/UserDashboard'
import WhyQueueWise from './components/WhyQueueWise'
import AuthModal from './components/AuthModal'
import ProfileModal from './components/ProfileModal'
import OnboardingModal from './components/OnboardingModal'
import Toast from './components/Toast'
import { offices, services } from './data/mockData'
import { useUserData } from './hooks/useUserData'
import { useAuthGuard } from './hooks/useAuthGuard'

export default function App() {
  const [step, setStep] = useState('landing')
  const [selectedOffice, setSelectedOffice] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [toasts, setToasts] = useState([])

  // ─── Centralized User Data Hook ───────────────────────────────────────────
  const {
    currentUser,
    savedVisits,
    visitHistory,
    activityHistory,
    notifications,
    queueReports,
    documentProgress,
    preferences,
    logout,
    addVisit,
    addHistory,
    addNotification,
    addQueueReport,
    updateVisitStatus,
    removeVisit,
    toggleReminder,
    updateDocumentProgress,
    updatePreferences,
    completeOnboarding,
    logActivity,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearNotifications,
    clearActivityHistory,
    refreshUserData,
  } = useUserData()

  // ─── First-Time Citizen Onboarding State ──────────────────────────────────
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [pendingPostAuth, setPendingPostAuth] = useState(null)

  // ─── Ephemeral Guest Fallback States (Used ONLY when unauthenticated) ──────
  const [guestVisits, setGuestVisits] = useState([])
  const [guestNotifications, setGuestNotifications] = useState([])
  const [guestActivities, setGuestActivities] = useState([])
  const [guestWatchers, setGuestWatchers] = useState({})

  // Active isolated slices
  const activeSavedVisits = currentUser ? savedVisits : guestVisits
  const activeNotifications = currentUser ? notifications : guestNotifications
  const activeActivities = currentUser ? activityHistory : guestActivities
  const activeWatchers = currentUser ? (preferences.watchers || {}) : guestWatchers

  // ─── Authentication Popover & Modal State ──────────────────────────────────
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: 'register',
    title: null,
    subtitle: null,
    message: null,
    onPostAuth: null,
  })

  // ─── Profile Dialog State ──────────────────────────────────────────────────
  const [profileModalOpen, setProfileModalOpen] = useState(false)

  // ─── My Visits Subtab ('overview' | 'visits' | 'history') ─────────────────
  const [myVisitsTab, setMyVisitsTab] = useState('overview')

  // Toast Helpers
  const addToast = useCallback((message, type = 'info') =>
    setToasts(t => [...t, { id: Date.now() + Math.random(), message, type }]), [])
  const removeToast = id => setToasts(t => t.filter(x => x.id !== id))

  // ─── Authentication Handlers ──────────────────────────────────────────────
  const handleOpenAuth = useCallback((paramsOrMode = 'register', message = null, onPostAuth = null) => {
    if (typeof paramsOrMode === 'object' && paramsOrMode !== null) {
      setAuthModal({
        isOpen: true,
        mode: paramsOrMode.mode || 'register',
        title: paramsOrMode.title || 'Create your free QueueWise account',
        subtitle: paramsOrMode.subtitle || 'Save visits, track your history, and get personalized queue alerts.',
        message: paramsOrMode.message || null,
        onPostAuth: paramsOrMode.onPostAuth || null,
      })
    } else {
      setAuthModal({
        isOpen: true,
        mode: paramsOrMode,
        title: paramsOrMode === 'login' ? 'Login to QueueWise' : 'Create your free QueueWise account',
        subtitle: 'Save visits, track your history, and get personalized queue alerts.',
        message,
        onPostAuth,
      })
    }
  }, [])

  // ─── Reusable Auth Guard ──────────────────────────────────────────────────
  const { requireAuth } = useAuthGuard({
    currentUser,
    onOpenAuth: handleOpenAuth,
  })

  // ─── Route Guard: Prevent Direct Unauthorized Access to Protected Steps ─
  useEffect(() => {
    if (!currentUser) {
      if (step === 'plan') {
        setStep('landing')
        requireAuth(() => {
          setStep('plan')
        }, {
          title: 'Create your free QueueWise account',
          subtitle: 'Save visits, track your history, and get personalized queue alerts.',
          initialMode: 'register',
        })
      } else if (step === 'my-visits') {
        setStep('landing')
        requireAuth(() => {
          setStep('my-visits')
        }, {
          title: 'Create your free QueueWise account',
          subtitle: 'Save visits, track your history, and get personalized queue alerts.',
          initialMode: 'login',
        })
      }
    }
  }, [step, currentUser, requireAuth])

  const handleAuthSuccess = (user, postAuthAction = null, meta = {}) => {
    refreshUserData()
    setAuthModal({ isOpen: false, mode: 'register', title: null, subtitle: null, message: null, onPostAuth: null })

    // Return the user immediately to the action they originally wanted to perform
    if (postAuthAction) {
      postAuthAction(user)
      return
    }

    // Only show onboarding to a newly registered user if not yet completed and no pending action
    if (meta?.isRegistration && user?.preferences?.onboardingCompleted !== true) {
      setShowOnboarding(true)
      return
    }

    if (step === 'login' || step === 'register') {
      setStep('my-visits')
    }
  }

  const handleCompleteOnboarding = () => {
    setShowOnboarding(false)
    completeOnboarding()
    addToast('✓ Welcome to QueueWise! Let’s plan your first government visit.', 'success')

    if (pendingPostAuth) {
      pendingPostAuth()
      setPendingPostAuth(null)
    } else {
      setStep('plan')
    }
  }

  const handleLogout = () => {
    logout()
    setShowOnboarding(false)
    setPendingPostAuth(null)
    setGuestVisits([])
    setGuestNotifications([])
    setGuestActivities([])
    setGuestWatchers({})
    setProfileModalOpen(false)
    setStep('landing')
    addToast('✓ Logged out successfully. Personal session closed.', 'info')
  }

  // ─── User Activity Logger ─────────────────────────────────────────────────
  const handleLogActivity = useCallback((type, title, office = null, service = null, details = null) => {
    if (currentUser) {
      logActivity(type, title, office, service, details)
    } else {
      const entry = {
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        type,
        title,
        office: office || '',
        service: service || '',
        details: details || '',
        timestamp: new Date().toISOString(),
      }
      setGuestActivities(prev => [entry, ...prev].slice(0, 50))
    }
  }, [currentUser, logActivity])

  // ─── Navigation Handlers ──────────────────────────────────────────────────
  const handleGetStarted = (office = null, service = null) => {
    requireAuth(() => {
      setSelectedOffice(office || null)
      setSelectedService(service || null)
      setStep('plan')
      if (office) {
        handleLogActivity('office_search', `Searched & selected office: ${office.name}`, office.name, service?.name, office.jurisdiction || 'Regional Office')
      }
    }, {
      title: 'Create your free QueueWise account',
      subtitle: 'Save visits, track your history, and get personalized queue alerts.',
      initialMode: 'register',
    })
  }

  const handleSelectOffice = (office) => {
    setSelectedOffice(office)
    setSelectedService(null)
    setStep('service')
    handleLogActivity('office_search', `Searched & selected office: ${office.name}`, office.name, null, office.jurisdiction || 'Regional Office')
  }

  const handleSelectService = (svc) => {
    setSelectedService(svc)
    setStep('dashboard')
    handleLogActivity('service_select', `Selected service: ${svc.name}`, selectedOffice?.name || '', svc.name, `Est. processing: ${svc.avgProcessingTime || '20-30 min'}`)
  }

  const handleNavigate = (id) => {
    if (id === 'plan') {
      requireAuth(() => {
        setStep('plan')
      }, {
        title: 'Create your free QueueWise account',
        subtitle: 'Save visits, track your history, and get personalized queue alerts.',
        initialMode: 'register',
      })
    } else if (id === 'office') {
      setStep('office')
    } else if (id === 'service') {
      setStep('service')
    } else if (id === 'dashboard') {
      setStep('dashboard')
    } else if (id === 'analytics') {
      setStep('analytics')
    } else if (id === 'why' || id === 'why-queuewise') {
      setStep('why')
    } else if (id === 'my-visits') {
      requireAuth(() => {
        setMyVisitsTab('overview')
        setStep('my-visits')
      }, {
        title: 'Create your free QueueWise account',
        subtitle: 'Save visits, track your history, and get personalized queue alerts.',
        initialMode: 'login',
      })
    } else if (id === 'history') {
      requireAuth(() => {
        setMyVisitsTab('history')
        setStep('my-visits')
      }, {
        title: 'Create your free QueueWise account',
        subtitle: 'Save visits, track your history, and get personalized queue alerts.',
        initialMode: 'login',
      })
    } else if (id === 'login') {
      handleOpenAuth('login')
    } else if (id === 'register') {
      handleOpenAuth('register')
    } else if (id === 'alerts') {
      addToast('No active alerts. Set one from the queue dashboard.', 'info')
    }
  }

  const handleHome = () => {
    setStep('landing')
  }

  // ─── Visit Plan Actions ───────────────────────────────────────────────────
  const handleSaveVisit = (pass) => {
    requireAuth((user) => {
      const userPass = {
        ...pass,
        citizenName: user.name,
        date: pass.date || 'Today',
        status: pass.status || 'Upcoming',
      }
      addVisit(userPass)
      addToast(`✓ Visit pass saved to your portfolio, ${user.name}!`, 'success')
    }, {
      title: 'Create your free QueueWise account',
      subtitle: 'Save visits, track your history, and get personalized queue alerts.',
      initialMode: 'register',
    })
  }

  const handleUpdateVisitStatus = (visitId, newStatus) => {
    if (currentUser) {
      updateVisitStatus(visitId, newStatus)
    } else {
      setGuestVisits(prev =>
        prev.map(p => {
          if (p.id === visitId) {
            const updated = { ...p, status: newStatus }
            if (newStatus === 'Completed') {
              updated.completedAt = new Date().toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            }
            return updated
          }
          return p
        })
      )
    }

    if (newStatus === 'Completed') {
      addToast(`✓ Appointment marked as Completed!`, 'success')
    } else if (newStatus === 'Cancelled') {
      addToast(`Appointment marked as Cancelled.`, 'info')
    } else {
      addToast(`Appointment restored to Upcoming.`, 'info')
    }
  }

  const handleArchiveVisit = (pass) => {
    handleUpdateVisitStatus(pass.id, 'Completed')
  }

  const handleRemoveVisit = (id) => {
    if (currentUser) {
      removeVisit(id)
    } else {
      setGuestVisits(prev => prev.filter(p => p.id !== id))
    }
    addToast('Visit pass removed from portfolio.', 'info')
  }

  const handleToggleReminder = (id) => {
    if (currentUser) {
      toggleReminder(id)
    } else {
      setGuestVisits(prev =>
        prev.map(p => (p.id === id ? { ...p, reminderActive: !p.reminderActive } : p))
      )
    }
    addToast('Reminder preference updated.', 'info')
  }

  const handleSimulateVisitAlert = (pass) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      type: 'queue_drop',
      title: 'Queue is getting shorter',
      officeName: pass.officeName,
      officeId: pass.officeId || 'rto',
      queueCount: 14,
      estimatedWait: 17,
      message: `Now may be a good time to visit for your ${pass.serviceName}.`,
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      read: false,
    }

    if (currentUser) {
      addNotification(newNotif)
    } else {
      setGuestNotifications(prev => [newNotif, ...prev])
    }
    addToast(`🔔 Queue is getting shorter at ${pass.officeName}! Current queue: 14 people (17 min wait). Now may be a good time to visit.`, 'success')
  }

  const handlePlanNew = () => {
    setSelectedOffice(null)
    setSelectedService(null)
    setStep('plan')
  }

  // ─── Notification Handlers ────────────────────────────────────────────────
  const handleMarkAsRead = (id) => {
    if (currentUser) {
      markNotificationRead(id)
    } else {
      setGuestNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    }
  }

  const handleMarkAllAsRead = () => {
    if (currentUser) {
      markAllNotificationsRead()
    } else {
      setGuestNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }
    addToast('✓ All notifications marked as read', 'info')
  }

  const handleDeleteNotification = (id) => {
    if (currentUser) {
      deleteNotification(id)
    } else {
      setGuestNotifications(prev => prev.filter(n => n.id !== id))
    }
    addToast('Notification dismissed', 'info')
  }

  const handleClearNotifications = () => {
    if (currentUser) {
      clearNotifications()
    } else {
      setGuestNotifications([])
    }
    addToast('Notification center cleared', 'info')
  }

  const handleClearHistory = () => {
    if (currentUser) {
      clearActivityHistory()
    } else {
      setGuestActivities([])
    }
    addToast('Activity history cleared', 'info')
  }

  const handleAddNotification = useCallback((notif) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      timeAgo: 'Just now',
      timestamp: new Date().toISOString(),
      read: false,
      ...notif,
    }
    if (currentUser) {
      addNotification(newNotif)
    } else {
      setGuestNotifications(prev => [newNotif, ...prev])
    }
    addToast(`🔔 ${newNotif.title}: ${newNotif.officeName} · ${newNotif.message}`, 'alert')
  }, [currentUser, addNotification, addToast])

  // Realistic queue change simulation (queue drops below threshold)
  const handleSimulateQueueDrop = useCallback((targetOfficeId = null) => {
    const offId = targetOfficeId || selectedOffice?.id || 'rto'
    const targetOffice = offices.find(o => o.id === offId) || offices[0]

    const newNotif = {
      id: `notif-${Date.now()}`,
      type: 'queue_drop',
      title: 'Queue is getting shorter',
      officeName: targetOffice.name,
      officeId: targetOffice.id,
      queueCount: 14,
      estimatedWait: 17,
      message: 'Now may be a good time to visit.',
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      read: false,
    }

    if (currentUser) {
      addNotification(newNotif)
    } else {
      setGuestNotifications(prev => [newNotif, ...prev.filter(n => n.id !== newNotif.id)])
    }
    addToast(`🔔 Queue is getting shorter: ${targetOffice.name} queue dropped to 14 people (17 min wait). Now may be a good time to visit.`, 'success')
  }, [selectedOffice, currentUser, addNotification, addToast])

  // Toggle watcher for an office
  const handleToggleQueueWatcher = useCallback((officeId, threshold = 18) => {
    requireAuth(() => {
      const targetOffice = offices.find(o => o.id === officeId) || offices[0]
      const current = activeWatchers[officeId]
      const nextState = !current?.enabled

      if (nextState) {
        addToast(`✓ Alert active: We will notify you when the queue at ${targetOffice.name} drops below ${threshold} people.`, 'success')
        handleLogActivity('reminder', `Subscribed to queue drop alerts`, targetOffice.name, null, `Alert threshold: < ${threshold} people`)
        setTimeout(() => {
          handleSimulateQueueDrop(officeId)
        }, 5500)
      } else {
        addToast(`Queue drop alert disabled for ${targetOffice.name}`, 'info')
      }

      const updatedWatcher = {
        officeId,
        officeName: targetOffice.name,
        threshold,
        enabled: nextState,
      }

      if (currentUser) {
        updatePreferences({
          watchers: {
            ...(preferences.watchers || {}),
            [officeId]: updatedWatcher,
          }
        })
      } else {
        setGuestWatchers(prev => ({
          ...prev,
          [officeId]: updatedWatcher,
        }))
      }
    }, {
      title: 'Create your free QueueWise account',
      subtitle: 'Save visits, track your history, and get personalized queue alerts.',
      initialMode: 'register',
    })
  }, [requireAuth, activeWatchers, currentUser, preferences, updatePreferences, addToast, handleLogActivity, handleSimulateQueueDrop])

  const handleAddQueueReport = useCallback((report) => {
    requireAuth(() => {
      if (currentUser) {
        addQueueReport(report)
      }
      addToast('✓ Queue report submitted to community feed', 'success')
    }, {
      title: 'Create your free QueueWise account',
      subtitle: 'Save visits, track your history, and get personalized queue alerts.',
      initialMode: 'register',
    })
  }, [requireAuth, currentUser, addQueueReport, addToast])

  // Navigation and breadcrumbs control
  const showBreadcrumbs = step !== 'landing' && step !== 'analytics' && step !== 'my-visits' && step !== 'plan' && step !== 'why' && step !== 'login' && step !== 'register'
  const navPadding = showBreadcrumbs ? 'pt-[97px]' : 'pt-16'

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans">
      <Navbar
        step={step}
        selectedOffice={selectedOffice}
        selectedService={selectedService}
        onNavigate={handleNavigate}
        onHome={handleHome}
        savedVisitsCount={activeSavedVisits.length}
        notifications={activeNotifications}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onOpenProfile={() => setProfileModalOpen(true)}
        onNavigateHistory={() => {
          setMyVisitsTab('history')
          setStep('my-visits')
        }}
        onMarkAllAsRead={handleMarkAllAsRead}
        onMarkAsRead={handleMarkAsRead}
        onClearNotifications={handleClearNotifications}
        onDeleteNotification={handleDeleteNotification}
        onSimulateDrop={handleSimulateQueueDrop}
      />

      <main key={step} className={`${navPadding} anim-slide-up`}>
        {step === 'landing' && (
          <LandingHero
            currentUser={currentUser}
            onGetStarted={handleGetStarted}
            onNavigate={handleNavigate}
          />
        )}
        {(step === 'login' || step === 'register') && (
          <AuthModal
            isOpen={true}
            isPage={true}
            initialMode={step === 'register' ? 'register' : 'login'}
            onSuccess={(user, meta) => {
              handleAuthSuccess(user, null, meta)
            }}
            showToast={addToast}
          />
        )}
        {(step === 'why' || step === 'why-queuewise') && (
          <WhyQueueWise
            isStandalone={true}
            onGetStarted={handleGetStarted}
            onNavigate={handleNavigate}
          />
        )}
        {step === 'plan' && (
          <PlanVisitWizard
            currentUser={currentUser}
            initialOffice={selectedOffice}
            initialService={selectedService}
            documentProgress={documentProgress}
            onUpdateDocumentProgress={updateDocumentProgress}
            onSaveVisit={handleSaveVisit}
            onViewMyVisits={() => {
              setMyVisitsTab('visits')
              setStep('my-visits')
            }}
            onRequireAuth={(postAuth) => {
              requireAuth(postAuth, {
                title: 'Create your free QueueWise account',
                subtitle: 'Save visits, track your history, and get personalized queue alerts.',
                initialMode: 'register',
              })
            }}
            onLogActivity={handleLogActivity}
            showToast={addToast}
          />
        )}
        {step === 'office' && (
          <OfficeSelector onSelect={handleSelectOffice} />
        )}
        {step === 'service' && selectedOffice && (
          <ServiceSelector office={selectedOffice} onSelect={handleSelectService} />
        )}
        {step === 'dashboard' && selectedOffice && selectedService && (
          <QueueDashboard
            office={selectedOffice}
            service={selectedService}
            currentUser={currentUser}
            onRequireAuth={(action) => requireAuth(action, {
              title: 'Create your free QueueWise account',
              subtitle: 'Save visits, track your history, and get personalized queue alerts.',
              initialMode: 'register',
            })}
            showToast={addToast}
            onSaveVisit={handleSaveVisit}
            queueWatchers={activeWatchers}
            onToggleQueueWatcher={handleToggleQueueWatcher}
            onSimulateDrop={handleSimulateQueueDrop}
            onLogActivity={handleLogActivity}
            onAddQueueReport={handleAddQueueReport}
          />
        )}
        {step === 'analytics' && (
          <AnalyticsDashboard showToast={addToast} />
        )}
        {step === 'my-visits' && (
          <UserDashboard
            currentUser={currentUser}
            visits={activeSavedVisits}
            activities={activeActivities}
            queueReports={queueReports}
            initialSection={myVisitsTab === 'history' ? 'history' : myVisitsTab === 'visits' ? 'visits' : 'overview'}
            onPlanNew={handlePlanNew}
            onUpdateVisitStatus={handleUpdateVisitStatus}
            onToggleReminder={handleToggleReminder}
            onRemoveVisit={handleRemoveVisit}
            onClearHistory={handleClearHistory}
            showToast={addToast}
          />
        )}
      </main>

      {/* ─── Civic Minimalist Footer ────────────────────────────────────── */}
      <footer className="mt-auto border-t border-[#E4E7EC] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Brand & Purpose */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded bg-[#0B5CAD] text-white flex items-center justify-center font-bold text-xs">
                  QW
                </div>
                <span className="font-bold text-base text-[#172033] tracking-tight">QueueWise</span>
                <span className="text-[10px] font-bold tracking-wider text-[#0B5CAD] bg-[#F6F8FB] border border-[#E4E7EC] px-1.5 py-0.5 rounded uppercase">
                  Lucknow District
                </span>
              </div>
              <p className="text-xs text-[#667085] leading-relaxed max-w-md">
                District civic queue management prototype. Empowers citizens to plan government office visits with real-time crowd estimates, smart document readiness checks, and optimal arrival recommendations.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-[#059669] font-medium pt-1">
                <span className="h-2 w-2 rounded-full bg-[#059669] inline-block"></span>
                <span>District Service Network Online · 5 Major Public Centers Active</span>
              </div>
            </div>

            {/* Col 2: Citizen Services */}
            <div>
              <h4 className="text-xs font-bold text-[#172033] uppercase tracking-wider mb-3">
                Citizen Services
              </h4>
              <ul className="space-y-2 text-xs text-[#667085]">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOffice(null)
                      setSelectedService(null)
                      setStep('landing')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="hover:text-[#0B5CAD] transition-colors"
                  >
                    Home Overview
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      requireAuth(() => {
                        setStep('plan')
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }, {
                        title: 'Create your free QueueWise account',
                        subtitle: 'Save visits, track your history, and get personalized queue alerts.',
                        initialMode: 'register',
                      })
                    }}
                    className="hover:text-[#0B5CAD] transition-colors"
                  >
                    Plan a Visit
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      requireAuth(() => {
                        setMyVisitsTab('visits')
                        setStep('my-visits')
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }, {
                        title: 'Create your free QueueWise account',
                        subtitle: 'Save visits, track your history, and get personalized queue alerts.',
                        initialMode: 'register',
                      })
                    }}
                    className="hover:text-[#0B5CAD] transition-colors"
                  >
                    My Visit Passes
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('why')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="hover:text-[#0B5CAD] transition-colors"
                  >
                    Why QueueWise?
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: District Administration */}
            <div>
              <h4 className="text-xs font-bold text-[#172033] uppercase tracking-wider mb-3">
                District Administration
              </h4>
              <ul className="space-y-2 text-xs text-[#667085]">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('analytics')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="flex items-center gap-1.5 text-[#0B5CAD] font-bold hover:underline"
                  >
                    <span>District Service Monitor</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-[#F6F8FB] border border-[#E4E7EC] rounded font-mono font-semibold">
                      Admin
                    </span>
                  </button>
                </li>
                <li className="text-[11px] text-[#667085] pt-1 leading-snug">
                  Operational console for district magistrates, department heads, and center supervisors to monitor office congestion and crowd alerts.
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Disclaimer */}
          <div className="mt-8 pt-6 border-t border-[#E4E7EC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#667085]">
            <p>
              © 2026 District Administration · QueueWise Prototype. Not an official government portal.
            </p>
            <p className="text-[11px]">
              Civic hackathon demonstration prototype. Client-side isolated data architecture.
            </p>
          </div>
        </div>
      </footer>

      {/* Pop-up Auth Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        title={authModal.title}
        subtitle={authModal.subtitle}
        message={authModal.message}
        onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))}
        onSuccess={(user, meta) => handleAuthSuccess(user, authModal.onPostAuth, meta)}
        showToast={addToast}
      />

      {/* Citizen Profile Dialog Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        user={currentUser}
        onClose={() => setProfileModalOpen(false)}
        onLogout={handleLogout}
        onNavigateVisits={() => {
          setMyVisitsTab('visits')
          setStep('my-visits')
        }}
        onNavigateHistory={() => {
          setMyVisitsTab('history')
          setStep('my-visits')
        }}
        savedVisitsCount={activeSavedVisits.length}
      />

      {/* First-Time Citizen Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        currentUser={currentUser}
        onComplete={handleCompleteOnboarding}
      />

      {/* Stacked Civic Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <Toast message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
          </div>
        ))}
      </div>
    </div>
  )
}
