import { useState, useEffect } from 'react'
import {
  Sparkles,
  Users,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Building2,
  TrendingDown,
  Check,
} from 'lucide-react'

export default function OnboardingModal({
  isOpen = true,
  currentUser = null,
  onComplete,
}) {
  const [currentStep, setCurrentStep] = useState(1) // 1, 2, 3

  // Handle ESC key to finish onboarding cleanly
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (onComplete) onComplete()
      } else if (e.key === 'ArrowRight' && currentStep < 3) {
        setCurrentStep(s => s + 1)
      } else if (e.key === 'ArrowLeft' && currentStep > 1) {
        setCurrentStep(s => s - 1)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentStep, onComplete])

  if (!isOpen) return null

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(s => s + 1)
    } else {
      if (onComplete) onComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(s => s - 1)
    }
  }

  const handleSkip = () => {
    if (onComplete) onComplete()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 anim-fade-in">
      <div className="w-full max-w-lg bg-white rounded-lg border border-[#CBD5E1] shadow-lg overflow-hidden anim-scale-up">

        {/* Civic Header Banner */}
        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-[#CBD5E1]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-[#0757A6] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              QW
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#0757A6] uppercase tracking-wider block">
                FIRST-TIME CITIZEN ONBOARDING
              </span>
              <span className="text-xs font-semibold text-[#0F172A]">
                Welcome to QueueWise
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-semibold text-[#475467] hover:text-[#0F172A] px-2 py-1 rounded hover:bg-[#E8F0F8] transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="bg-[#EEF3F8] px-6 py-2.5 border-b border-[#CBD5E1] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            {[1, 2, 3].map((stepNum) => {
              const isActive = currentStep === stepNum
              const isPast = currentStep > stepNum
              return (
                <div key={stepNum} className="flex-1">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-[#0757A6]'
                        : isPast
                        ? 'bg-[#087F75]'
                        : 'bg-[#CBD5E1]'
                    }`}
                  />
                </div>
              )
            })}
          </div>
          <span className="text-[11px] font-bold text-[#475467] whitespace-nowrap">
            STEP {currentStep} OF 3
          </span>
        </div>

        {/* Step Body Content */}
        <div className="p-6 sm:p-8 space-y-5">

          {/* STEP 1: WELCOME TO QUEUEWISE */}
          {currentStep === 1 && (() => {
            const firstName = currentUser?.name ? currentUser.name.trim().split(' ')[0] : ''
            return (
              <div className="space-y-4 anim-fade-in">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#EFF6FC] border border-[#D0E4F7] text-[#0757A6] flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#0757A6] uppercase tracking-wider block">
                      Step 1 of 3
                    </span>
                    <h2 className="text-xl font-bold text-[#0F172A]">
                      {firstName ? `Welcome, ${firstName}` : 'Welcome to QueueWise'}
                    </h2>
                  </div>
                </div>

                <p className="text-sm font-medium text-[#0F172A] leading-relaxed">
                  {firstName ? "Let's plan your first visit." : 'Plan your government visit before you leave home.'}
                </p>

              <div className="p-4 bg-[#EEF3F8] rounded-lg border border-[#CBD5E1] space-y-2.5 text-xs text-[#475467]">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-[#087F75] shrink-0 mt-0.5" />
                  <span><strong>Live Office Monitoring</strong>: Real-time queues for RTO, DM, Municipal, Tehsil, and Passport.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-[#087F75] shrink-0 mt-0.5" />
                  <span><strong>Document Preparation</strong>: Check all required certificates beforehand to avoid repeat trips.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-[#087F75] shrink-0 mt-0.5" />
                  <span><strong>Private Portfolio</strong>: Safely store your appointments and arrival reminders.</span>
                </div>
              </div>
            </div>
          )
        })()}

          {/* STEP 2: CHECK THE QUEUE */}
          {currentStep === 2 && (
            <div className="space-y-4 anim-fade-in">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309] flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#B45309] uppercase tracking-wider block">
                    Step 2 of 3
                  </span>
                  <h2 className="text-xl font-bold text-[#0F172A]">
                    Check the queue
                  </h2>
                </div>
              </div>

              <p className="text-sm font-medium text-[#0F172A] leading-relaxed">
                See current crowd levels and estimated waiting time.
              </p>

              {/* Live Preview Card */}
              <div className="p-4 bg-white rounded-lg border border-[#CBD5E1] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#CBD5E1]">
                  <span className="text-xs font-bold text-[#0F172A]">
                    RTO Office Lucknow Â· Current Feed
                  </span>
                  <span className="badge badge-low text-[10px]">
                    Low Crowd
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="p-2.5 bg-[#EEF3F8] rounded border border-[#CBD5E1]">
                    <span className="text-[10px] font-bold text-[#475467] uppercase block">
                      CURRENT QUEUE
                    </span>
                    <span className="text-xl font-bold text-[#0F172A] tabular-nums">
                      14 people
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#EEF3F8] rounded border border-[#CBD5E1]">
                    <span className="text-[10px] font-bold text-[#475467] uppercase block">
                      ESTIMATED WAIT
                    </span>
                    <span className="text-xl font-bold text-[#0757A6] tabular-nums">
                      17 minutes
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-[#475467] text-right">
                  Updated 4 mins ago
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CHOOSE A BETTER TIME */}
          {currentStep === 3 && (
            <div className="space-y-4 anim-fade-in">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#EFF6FC] border border-[#D0E4F7] text-[#0757A6] flex items-center justify-center shrink-0">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#0757A6] uppercase tracking-wider block">
                    Step 3 of 3
                  </span>
                  <h2 className="text-xl font-bold text-[#0F172A]">
                    Choose a better time
                  </h2>
                </div>
              </div>

              <p className="text-sm font-medium text-[#0F172A] leading-relaxed">
                Use QueueWise predictions to plan your visit.
              </p>

              {/* Recommended Timing Card */}
              <div className="p-4 bg-[#EFF6FC] rounded-lg border border-[#D0E4F7] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0757A6]">
                    RECOMMENDED WINDOW
                  </span>
                  <span className="text-xs font-bold text-[#087F75]">
                    94% High Confidence
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-base font-bold text-[#0F172A]">
                    Today Â· 2:00 PM â€“ 3:00 PM
                  </span>
                  <span className="text-xs font-bold text-[#0757A6]">
                    ~18 min wait
                  </span>
                </div>
                <p className="text-xs text-[#475467] pt-1 leading-relaxed">
                  Avoid the 10:00 AM peak rush of 65+ minutes by visiting during verified low-congestion slots.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 bg-[#EEF3F8] border-t border-[#CBD5E1] flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="btn-secondary py-2 px-3.5 text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-semibold text-[#475467] hover:text-[#0F172A] py-2 px-3"
            >
              Skip
            </button>
          )}

          <div>
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary py-2 px-5 text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary py-2.5 px-6 text-xs font-bold flex items-center gap-2 shadow-xs"
              >
                <span>Start Planning</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}


