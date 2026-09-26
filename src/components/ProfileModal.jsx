import { useState } from 'react'
import {
  X,
  User,
  Mail,
  ShieldCheck,
  Calendar,
  LogOut,
  Clock,
  Ticket,
  CheckCircle2,
  HardDrive,
} from 'lucide-react'

export default function ProfileModal({
  user,
  isOpen,
  onClose,
  onLogout,
  onNavigateVisits,
  onNavigateHistory,
  savedVisitsCount = 0,
}) {
  if (!isOpen || !user) return null

  const initials = user.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map(w => w[0].toUpperCase())
        .slice(0, 2)
        .join('')
    : 'QW'

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs anim-fade-in">
      <div className="w-full max-w-md bg-white rounded-xl border border-[#CBD5E1] shadow-lg overflow-hidden anim-scale-up">
        {/* Header */}
        <div className="p-6 border-b border-[#CBD5E1] bg-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 h-8 w-8 rounded-md bg-[#EEF3F8] hover:bg-[#CBD5E1] text-[#475467] hover:text-[#0F172A] flex items-center justify-center transition-colors focus-ring"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-[#0757A6] text-white flex items-center justify-center text-base font-bold shadow-xs">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-bold tracking-wider text-[#059669] uppercase bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
                  Active Citizen Profile
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] tracking-tight leading-snug">
                {user.name}
              </h3>
              <p className="text-xs text-[#475467]">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#EEF3F8] border border-[#CBD5E1]">
              <span className="text-[10px] font-bold text-[#475467] uppercase tracking-wider block">
                Citizen Account ID
              </span>
              <p className="font-mono font-bold text-[#0F172A] mt-0.5 truncate">
                {user.id || 'usr_registered'}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#EEF3F8] border border-[#CBD5E1]">
              <span className="text-[10px] font-bold text-[#475467] uppercase tracking-wider block">
                Member Since
              </span>
              <p className="font-semibold text-[#0F172A] mt-0.5">
                {user.createdAt || 'Today'}
              </p>
            </div>
          </div>

          {/* Data Isolation Verification */}
          <div className="p-3.5 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#065F46] font-bold">
              <ShieldCheck className="h-4 w-4 text-[#059669]" />
              <span>Strict Profile Data Partition</span>
            </div>
            <p className="text-[11px] text-[#047857] leading-snug">
              Your visits, notifications, and document checklists are isolated to your local partition. They are never accessible to any other user on this device.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#EEF3F8] border border-[#CBD5E1] text-xs">
            <span className="text-[#475467] font-medium">Active Saved Visit Passes:</span>
            <span className="font-bold text-[#0757A6] bg-white px-2 py-0.5 rounded border border-[#CBD5E1]">
              {savedVisitsCount} Passes
            </span>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {onNavigateVisits && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onNavigateVisits()
                }}
                className="w-full btn-secondary py-2 text-xs font-bold justify-center"
              >
                <Ticket className="h-3.5 w-3.5 text-blue-800" />
                <span>View My Visits</span>
              </button>
            )}

            {onNavigateHistory && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onNavigateHistory()
                }}
                className="w-full btn-secondary py-2 text-xs font-bold justify-center"
              >
                <Clock className="h-3.5 w-3.5 text-slate-700" />
                <span>View Visit History</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose()
                if (onLogout) onLogout()
              }}
              className="w-full py-2 px-3 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


