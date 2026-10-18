'use client'

import React, { useState } from 'react'
import { Bell, X, Check, ShieldCheck, Mail } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface AlertsModalProps {
  isOpen: boolean
  onClose: () => void
  productTitle: string
  currentPrice: number
  currency?: string
}

export function AlertsModal({
  isOpen,
  onClose,
  productTitle,
  currentPrice,
  currency = '$'
}: AlertsModalProps) {
  const [targetPrice, setTargetPrice] = useState(
    Math.round(currentPrice * 0.9).toString()
  )
  const [email, setEmail] = useState('')
  const [saved, setSaved] = useState(false)

  if (!isOpen) return null

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email')
      return
    }

    setSaved(true)
    toast.success(`Price alert activated! We'll notify you if price drops below ${currency}${targetPrice}.`)
    setTimeout(() => {
      setSaved(false)
      onClose()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[var(--card-bg)] border border-[var(--border-light)] rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-full hover:bg-[var(--card-border)]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center border border-emerald-500/30">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--text-main)]">Set Price Alert</h3>
            <p className="text-xs text-[var(--text-muted)]">Instant price drop notification</p>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-light)] mb-4">
          <p className="text-xs text-[var(--text-muted)] truncate">Product</p>
          <p className="text-sm font-semibold text-[var(--text-main)] truncate mt-0.5">
            {productTitle}
          </p>
          <p className="text-xs text-emerald-500 font-bold mt-1">
            Current Best: {currency}{currentPrice}
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1.5">
              Notify me when price drops below
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-sm font-bold text-[var(--text-muted)]">
                {currency}
              </span>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                required
                className="w-full bg-[var(--bg-color)] border border-[var(--border-light)] rounded-xl py-2.5 pl-8 pr-4 text-sm font-bold text-[var(--text-main)] outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1.5">
              Your Email
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[var(--bg-color)] border border-[var(--border-light)] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[var(--text-main)] outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saved}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Alert Saved!
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                Activate Alert
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
