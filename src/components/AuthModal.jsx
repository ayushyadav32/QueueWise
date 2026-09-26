import { useState, useEffect } from 'react'
import {
  X,
  Lock,
  Mail,
  User,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { registerAccount, loginAccount } from '../utils/auth'

export default function AuthModal({
  isOpen = true,
  initialMode = 'register',
  title = null,
  subtitle = null,
  onClose,
  onSuccess,
  showToast,
  isPage = false,
  message = null,
}) {
  const [mode, setMode] = useState(initialMode) // 'login' | 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // Synchronize mode when initialMode or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'register')
      setError(null)
    }
  }, [isOpen, initialMode])

  if (!isOpen && !isPage) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter carefully.')
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }

      setLoading(true)
      try {
        const user = registerAccount({ name, email, password })
        setLoading(false)
        if (showToast) {
          showToast(`âœ“ Account created successfully! Welcome, ${user.name}.`, 'success')
        }
        if (onSuccess) {
          onSuccess(user, { isRegistration: true })
        }
      } catch (err) {
        setLoading(false)
        setError(err.message)
      }
    } else {
      // Login
      setLoading(true)
      try {
        const user = loginAccount(email, password)
        setLoading(false)
        if (showToast) {
          showToast(`âœ“ Welcome back, ${user.name}!`, 'success')
        }
        if (onSuccess) {
          onSuccess(user, { isRegistration: false })
        }
      } catch (err) {
        setLoading(false)
        setError(err.message)
      }
    }
  }

  const defaultRegisterTitle = 'Create your free QueueWise account'
  const defaultRegisterSubtitle = 'Save visits, track your history, and get personalized queue alerts.'
  const defaultLoginTitle = 'Login to QueueWise'
  const defaultLoginSubtitle = 'Access your verified visit plans, queue drop watchers, and personal history.'

  const displayTitle = title || (mode === 'register' ? defaultRegisterTitle : defaultLoginTitle)
  const displaySubtitle = subtitle || (mode === 'register' ? defaultRegisterSubtitle : defaultLoginSubtitle)

  const content = (
    <div className="w-full max-w-md bg-white rounded-xl border border-[#CBD5E1] shadow-lg overflow-hidden anim-scale-up">
      {/* Modal Header */}
      <div className="p-6 border-b border-[#CBD5E1] bg-white relative">
        {!isPage && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 h-8 w-8 rounded-md bg-[#EEF3F8] hover:bg-[#CBD5E1] text-[#475467] hover:text-[#0F172A] flex items-center justify-center transition-colors focus-ring"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="flex items-center gap-2 mb-2">
          <div className="h-6 w-6 rounded bg-[#0757A6] text-white flex items-center justify-center font-bold text-xs">
            QW
          </div>
          <span className="text-[11px] font-bold tracking-wider text-[#0757A6] uppercase">
            District Citizen Portal
          </span>
        </div>

        <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">
          {displayTitle}
        </h2>
        <p className="text-xs text-[#475467] mt-1">
          {displaySubtitle}
        </p>

        {/* Tab Toggle Bar: [Create Account] and [Login] */}
        <div className="mt-4 grid grid-cols-2 p-1 rounded-lg bg-[#EEF3F8] border border-[#CBD5E1] text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('register')
              setError(null)
            }}
            className={`py-1.5 rounded-md transition-all ${
              mode === 'register'
                ? 'bg-[#0757A6] text-white shadow-xs font-bold'
                : 'text-[#475467] hover:text-[#0F172A]'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setError(null)
            }}
            className={`py-1.5 rounded-md transition-all ${
              mode === 'login'
                ? 'bg-[#0757A6] text-white shadow-xs font-bold'
                : 'text-[#475467] hover:text-[#0F172A]'
            }`}
          >
            Login
          </button>
        </div>
      </div>

      {/* Form Body */}
      <div className="p-6">
        {message && (
          <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-[#475467]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input pl-9 text-sm"
                  autoFocus={mode === 'register'}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#475467]" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input pl-9 text-sm"
                autoFocus={mode === 'login'}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              {mode === 'register' && (
                <span className="text-[10px] text-[#475467]">Min 6 characters</span>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#475467]" />
              <input
                type="password"
                required
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input pl-9 text-sm"
              />
            </div>
          </div>

          {/* Confirm Password (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#475467]" />
                <input
                  type="password"
                  required
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input pl-9 text-sm"
                />
              </div>
            </div>
          )}

          {/* Data Privacy Guarantee */}
          <div className="p-3 bg-[#E8F0F8] border border-slate-200/80 rounded-lg text-[11px] text-[#344054] space-y-1">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Strict User Data Isolation
            </div>
            <p className="leading-snug">
              Each citizen account is partitioned in local storage. Your saved visit passes and notifications are strictly private to your session.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 text-sm font-bold justify-center shadow-xs"
          >
            <span>{loading ? 'Processingâ€¦' : mode === 'register' ? 'Create Account' : 'Login'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Footer switch */}
        <div className="mt-4 pt-4 border-t border-[#CBD5E1] text-center text-xs text-[#475467]">
          {mode === 'register' ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError(null)
                }}
                className="text-[#0757A6] font-bold hover:underline"
              >
                Log In
              </button>
            </p>
          ) : (
            <p>
              New to QueueWise?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register')
                  setError(null)
                }}
                className="text-[#0757A6] font-bold hover:underline"
              >
                Create an account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )

  if (isPage) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        {content}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs anim-fade-in">
      {content}
    </div>
  )
}


