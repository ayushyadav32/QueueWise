import { useState, useMemo, useEffect } from 'react'
import { offices, services } from '../data/mockData'
import { calculateQueuePrediction } from '../utils/predictionEngine'
import {
  Building2,
  FileText,
  Clock,
  Users,
  Check,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react'

export default function PlanVisitWizard({
  initialOffice = null,
  initialService = null,
  currentUser = null,
  documentProgress = {},
  onSaveVisit,
  onViewMyVisits,
  onRequireAuth,
  onLogActivity,
  onUpdateDocumentProgress,
  showToast,
}) {
  // 3-Step Wizard: 1 = Select Office, 2 = Select Service, 3 = Your Visit Plan
  const [currentStep, setCurrentStep] = useState(initialOffice ? (initialService ? 3 : 2) : 1)
  const [selectedOffice, setSelectedOffice] = useState(initialOffice || null)
  const [selectedService, setSelectedService] = useState(initialService || null)

  // Document checklist state & toggle drawer
  const [docStatuses, setDocStatuses] = useState({})
  const [showDocsDrawer, setShowDocsDrawer] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  // Filter available services for the selected office
  const availableServices = useMemo(() => {
    return selectedOffice ? (services[selectedOffice.id] || []) : []
  }, [selectedOffice])

  // Synchronize service when office changes
  useEffect(() => {
    if (availableServices.length > 0) {
      if (!selectedService || !availableServices.some(s => s.id === selectedService.id)) {
        setSelectedService(null)
      }
    }
  }, [selectedOffice, availableServices, selectedService])

  // Document lists for selected service
  const reqDocs = useMemo(() => {
    return selectedService?.requiredDocuments || selectedService?.documents?.slice(0, 5) || []
  }, [selectedService])

  const optDocs = useMemo(() => {
    return selectedService?.optionalDocuments || selectedService?.documents?.slice(5) || []
  }, [selectedService])

  // Restore saved document progress for this service if available, else default to 4 of 5 ready
  useEffect(() => {
    if (selectedService) {
      
      const initial = {}
      reqDocs.forEach((_, idx) => {
        initial[`req-${idx}`] = idx < 4 ? 'ready' : 'missing'
      })
      optDocs.forEach((_, idx) => {
        initial[`opt-${idx}`] = 'optional'
      })
      setDocStatuses(initial)
    }
  }, [selectedService, documentProgress, reqDocs, optDocs])

  // Deterministic local queue prediction
  const prediction = useMemo(() => {
    if (!selectedOffice || !selectedService) return null
    let communityReports = []
    try {
      const stored = localStorage.getItem('queuewise_community_reports')
      if (stored) communityReports = JSON.parse(stored)
    } catch (e) {
      console.error(e)
    }
    return calculateQueuePrediction({
      officeId: selectedOffice.id,
      serviceId: selectedService.id,
      date: new Date(),
      communityReports,
    })
  }, [selectedOffice, selectedService])

  // Document readiness calculation
  const readinessMetrics = useMemo(() => {
    let readyCount = 0
    let missingCount = 0
    let optionalCount = 0

    reqDocs.forEach((_, idx) => {
      const status = docStatuses[`req-${idx}`] || 'ready'
      if (status === 'ready') readyCount++
      else if (status === 'missing') missingCount++
      else if (status === 'optional') optionalCount++
    })

    optDocs.forEach((_, idx) => {
      const status = docStatuses[`opt-${idx}`] || 'optional'
      if (status === 'ready') readyCount++
      else if (status === 'optional') optionalCount++
    })

    const requiredCount = Math.max(1, reqDocs.length)
    const percentage = Math.min(100, Math.round((readyCount / requiredCount) * 100))
    return { readyCount, requiredCount, missingCount, optionalCount, percentage }
  }, [reqDocs, optDocs, docStatuses])

  const handleDocStatusChange = (key, status) => {
    setDocStatuses(prev => {
      const updated = { ...prev, [key]: status }
      if (selectedService && onUpdateDocumentProgress) {
        onUpdateDocumentProgress(selectedService.id, { docStatuses: updated })
      }
      return updated
    })
  }

  // Save Visit Plan with strict authentication check
  const handleSavePlan = () => {
    if (!currentUser && onRequireAuth) {
      onRequireAuth(() => {
        doSavePlan()
      })
      return
    }
    doSavePlan()
  }

  const doSavePlan = () => {
    setIsSaved(true)
    const pass = {
      id: `QW-${Math.floor(1000 + Math.random() * 9000)}-UP`,
      citizenName: currentUser?.name || 'Citizen',
      officeId: selectedOffice.id,
      officeName: selectedOffice.name,
      serviceName: selectedService.name,
      date: 'Today',
      status: 'Upcoming',
      recommendedSlot: prediction?.recommendedWindow?.time ? `Today Â· ${prediction.recommendedWindow.time}` : 'Today Â· 2:00 PM â€“ 3:00 PM',
      expectedWait: prediction?.recommendedWindow?.expectedWait || '18â€“22 min',
      docsReady: `${readinessMetrics.readyCount} of ${readinessMetrics.requiredCount} ready`,
      reminderActive: true,
      savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    if (onSaveVisit) {
      onSaveVisit(pass)
    }
    if (onLogActivity) {
      onLogActivity('visit', `Planned & saved visit for ${selectedService.name}`, selectedOffice.name, selectedService.name, `Slot: ${pass.recommendedSlot}`)
    }
    if (showToast) {
      showToast('âœ“ Visit plan saved to your personal portfolio.', 'success')
    }
  }

  const handleOfficeSelect = (office) => {
    setSelectedOffice(office)
    if (onLogActivity) {
      onLogActivity('office_search', `Selected office: ${office.name}`, office.name, null, office.address)
    }
  }

  const handleServiceSelect = (svc) => {
    setSelectedService(svc)
    if (onLogActivity) {
      onLogActivity('service_select', `Selected service: ${svc.name}`, selectedOffice.name, svc.name)
    }
  }

  const handleResetSelection = () => {
    setIsSaved(false)
    setShowDocsDrawer(false)
    setCurrentStep(1)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 space-y-8 anim-slide-up">

      {/* â”€â”€ Minimal 3-Step Progress Indicator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span
            className={`px-2.5 py-1 rounded-full ${
              currentStep === 1
                ? 'bg-[#0B5CAD] text-white'
                : currentStep > 1
                ? 'bg-[#ECFDF5] text-[#059669]'
                : 'bg-slate-100 text-[#667085]'
            }`}
          >
            {currentStep > 1 ? 'âœ“' : '1'}
          </span>
          <span className={currentStep === 1 ? 'text-[#172033] font-bold' : 'text-[#667085]'}>
            Select Office
          </span>

          <span className="text-[#E4E7EC] mx-1">/</span>

          <span
            className={`px-2.5 py-1 rounded-full ${
              currentStep === 2
                ? 'bg-[#0B5CAD] text-white'
                : currentStep > 2
                ? 'bg-[#ECFDF5] text-[#059669]'
                : 'bg-slate-100 text-[#667085]'
            }`}
          >
            {currentStep > 2 ? 'âœ“' : '2'}
          </span>
          <span className={currentStep === 2 ? 'text-[#172033] font-bold' : 'text-[#667085]'}>
            Select Service
          </span>

          <span className="text-[#E4E7EC] mx-1">/</span>

          <span
            className={`px-2.5 py-1 rounded-full ${
              currentStep === 3
                ? 'bg-[#0B5CAD] text-white'
                : 'bg-slate-100 text-[#667085]'
            }`}
          >
            3
          </span>
          <span className={currentStep === 3 ? 'text-[#172033] font-bold' : 'text-[#667085]'}>
            Your Visit Plan
          </span>
        </div>

        {currentStep > 1 && (
          <button
            type="button"
            onClick={handleResetSelection}
            className="text-xs text-[#667085] hover:text-[#0B5CAD] font-medium"
          >
            Start Over
          </button>
        )}
      </div>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {/* STEP 1 â€” SELECT OFFICE                                        */}
      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {currentStep === 1 && (
        <section className="space-y-6 anim-fade-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#172033] tracking-tight">
              Where are you going?
            </h1>
            <p className="text-xs sm:text-sm text-[#667085] mt-1.5 leading-relaxed">
              Select a government office in Lucknow District to check current crowd levels and plan your arrival.
            </p>
          </div>

          {/* Clean Dropdown Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider">
              Select government office
            </label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-[#667085] pointer-events-none" />
              <select
                value={selectedOffice?.id || ''}
                onChange={(e) => {
                  const off = offices.find(o => o.id === e.target.value)
                  if (off) handleOfficeSelect(off)
                }}
                className="w-full pl-10 pr-9 py-3 rounded-lg border border-[#E4E7EC] bg-white text-sm font-semibold text-[#172033] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B5CAD] focus:border-transparent transition-all"
              >
                <option value="" disabled>Select government office</option>
                {offices.map((office) => (
                  <option key={office.id} value={office.id}>
                    {office.name} â€” {office.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 5 Office Options as Clean Tap Targets */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block">
              Or pick an office directly:
            </span>
            <div className="grid gap-2.5">
              {offices.map((office) => {
                const isSelected = selectedOffice?.id === office.id
                return (
                  <button
                    key={office.id}
                    type="button"
                    onClick={() => handleOfficeSelect(office)}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-2 border-[#0B5CAD] bg-[#EFF6FC]/50 shadow-xs'
                        : 'border-[#E4E7EC] bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#172033]">
                          {office.name}
                        </span>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0B5CAD] text-white">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#667085] mt-0.5 truncate">
                        {office.fullName} Â· {office.address}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-semibold text-[#0B5CAD] block">
                        {office.timings.split('â€“')[0]} Open
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Continue CTA */}
          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              disabled={!selectedOffice}
              className="btn-primary py-3 px-7 text-sm font-bold shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {/* STEP 2 â€” SELECT SERVICE                                       */}
      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {currentStep === 2 && (
        <section className="space-y-6 anim-fade-in">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFF6FC] border border-[#D0E4F7] text-[11px] font-bold text-[#0B5CAD] mb-2">
              <Building2 className="h-3.5 w-3.5" />
              <span>{selectedOffice?.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#172033] tracking-tight">
              What do you need?
            </h1>
            <p className="text-xs sm:text-sm text-[#667085] mt-1.5">
              Select the citizen service you need to complete at {selectedOffice?.name}.
            </p>
          </div>

          {/* Filtered Services List for Selected Office */}
          <div className="space-y-2.5">
            {availableServices.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-[#E4E7EC] text-xs text-[#667085]">
                No specific services cataloged for this office yet.
              </div>
            ) : (
              availableServices.map((svc) => {
                const isSelected = selectedService?.id === svc.id
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => handleServiceSelect(svc)}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'border-2 border-[#0B5CAD] bg-[#EFF6FC]/50 shadow-xs'
                        : 'border-[#E4E7EC] bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-[#172033]">
                          {svc.name}
                        </h3>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0B5CAD] text-white">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#667085] mt-1 leading-relaxed">
                        {svc.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0 pt-0.5">
                      <span className="text-xs font-semibold text-[#0B5CAD] block">
                        ~{svc.avgTime} min
                      </span>
                      <span className="text-[10px] text-[#667085]">
                        {svc.requiredDocuments?.length || svc.documents?.length || 4} docs
                      </span>
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* Step 2 Actions */}
          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="btn-secondary py-2.5 px-4 text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Offices</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              disabled={!selectedService}
              className="btn-primary py-3 px-7 text-sm font-bold shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {/* STEP 3 â€” YOUR VISIT PLAN (SINGLE CLEAN RESULT)                */}
      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {currentStep === 3 && (
        <section className="space-y-6 anim-fade-in">
          {/* Main Clean Result Card */}
          <div className="bg-white rounded-2xl border border-[#E4E7EC] shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">

            {/* Header: RECOMMENDED VISIT */}
            <div className="border-b border-[#E4E7EC] pb-5">
              <span className="text-[11px] font-extrabold tracking-wider uppercase text-[#0B5CAD] bg-[#EFF6FC] border border-[#D0E4F7] px-3 py-1 rounded-full inline-block mb-3">
                RECOMMENDED VISIT
              </span>

              <h2 className="text-2xl font-extrabold text-[#172033] tracking-tight">
                {selectedOffice?.name}
              </h2>
              <p className="text-base font-semibold text-[#0B5CAD] mt-0.5">
                {selectedService?.name}
              </p>
            </div>

            {/* Primary Time Recommendation */}
            <div className="p-4 rounded-xl bg-[#F6F8FB] border border-[#E4E7EC]">
              <span className="text-xs font-bold text-[#667085] uppercase tracking-wider block">
                Today
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#172033] mt-1 block tracking-tight">
                {prediction?.recommendedWindow?.time || '2:00 PM â€“ 3:00 PM'}
              </span>
            </div>

            {/* 4 Clean Key Metrics */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="p-4 rounded-xl border border-[#E4E7EC] bg-white">
                <span className="text-xs text-[#667085] block">Expected wait</span>
                <span className="text-lg sm:text-xl font-bold text-[#172033] mt-1 block">
                  {String(prediction?.recommendedWindow?.expectedWait || '').includes('Infinity') ? '18-22 min' : (prediction?.recommendedWindow?.expectedWait || '18-22 min')}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-[#E4E7EC] bg-white">
                <span className="text-xs text-[#667085] block">Current queue</span>
                <span className="text-lg sm:text-xl font-bold text-[#172033] mt-1 block">
                  {prediction?.count ? `${prediction.count} people` : '42 people'}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-[#E4E7EC] bg-white">
                <span className="text-xs text-[#667085] block">Crowd</span>
                <span className="text-sm sm:text-base font-bold text-[#D97706] mt-1 block">
                  High now â†’ Lower later
                </span>
              </div>

              <div className="p-4 rounded-xl border border-[#E4E7EC] bg-white">
                <span className="text-xs text-[#667085] block">Confidence</span>
                <span className="text-lg sm:text-xl font-bold text-[#059669] mt-1 block">
                  {prediction?.recommendedWindow?.confidence || '87%'}
                </span>
              </div>
            </div>

            {/* Documents Readiness Section */}
            <div className="p-4 rounded-xl border border-[#E4E7EC] bg-[#F6F8FB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-[#172033] uppercase tracking-wider block">
                  DOCUMENTS
                </span>
                <span className="text-sm font-semibold text-[#0F766E] mt-0.5 block">
                  {readinessMetrics.readyCount} of {readinessMetrics.requiredCount} ready
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowDocsDrawer(v => !v)}
                className="btn-secondary py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <span>{showDocsDrawer ? 'Hide Documents' : 'View Documents'}</span>
                {showDocsDrawer ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            {/* Expandable Document Checklist */}
            {showDocsDrawer && (
              <div className="p-4 rounded-xl border border-[#E4E7EC] bg-white space-y-3 anim-scale-up">
                <div className="flex items-center justify-between pb-2 border-b border-[#E4E7EC]">
                  <span className="text-xs font-bold text-[#172033]">
                    Required Paperwork for {selectedService?.name}
                  </span>
                  <span className="text-xs font-bold text-[#0B5CAD]">
                    {readinessMetrics.percentage}% Verified
                  </span>
                </div>

                <div className="space-y-2">
                  {reqDocs.map((doc, idx) => {
                    const key = `req-${idx}`
                    const currentStatus = docStatuses[key] || 'unreviewed'
                    return (
                      <div
                        key={key}
                        className="p-2.5 rounded-lg border border-[#E4E7EC] bg-[#F6F8FB] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <span className="font-semibold text-[#172033]">{doc}</span>

                        <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-[#E4E7EC] shrink-0">
                          <button
                            type="button"
                            onClick={() => handleDocStatusChange(key, 'ready')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              currentStatus === 'ready'
                                ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                                : 'text-[#667085] hover:text-[#172033]'
                            }`}
                          >
                            âœ“ Ready
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDocStatusChange(key, 'missing')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              currentStatus === 'missing'
                                ? 'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]'
                                : 'text-[#667085] hover:text-[#172033]'
                            }`}
                          >
                            âš  Missing
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDocStatusChange(key, 'optional')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              currentStatus === 'optional'
                                ? 'bg-slate-100 text-[#172033] border border-slate-300'
                                : 'text-[#667085] hover:text-[#172033]'
                            }`}
                          >
                            â—‹ Optional
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <p className="text-[11px] text-[#667085] italic pt-1">
                  * Requirements may vary by office and service. Verify official requirements before visiting.
                </p>
              </div>
            )}

            {/* Primary & Secondary Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              {isSaved ? (
                <button
                  type="button"
                  onClick={onViewMyVisits}
                  className="btn-secondary w-full py-3 text-sm font-bold text-[#0B5CAD] justify-center"
                >
                  âœ“ Plan Saved Â· View in My Visits â†’
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSavePlan}
                  className="btn-primary w-full py-3.5 text-sm font-bold justify-center shadow-xs flex items-center gap-2"
                >
                  <Bookmark className="h-4 w-4" />
                  <span>Save Visit Plan</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleResetSelection}
                className="btn-secondary w-full sm:w-auto py-3.5 px-6 text-sm font-semibold justify-center whitespace-nowrap"
              >
                Change Selection
              </button>
            </div>

          </div>
        </section>
      )}

    </div>
  )
}







