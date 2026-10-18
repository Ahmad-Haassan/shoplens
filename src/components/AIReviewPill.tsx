'use client'

import React from 'react'
import { MessageSquare, Star } from 'lucide-react'

interface AIReviewPillProps {
  sentimentPercentage?: number
  sentimentHighlight?: string
  rating?: number
  reviewCount?: number
  prosSummary?: string
  negSummary?: string
  fullVerdict?: string
}

export function AIReviewPill({
  sentimentPercentage = 94,
  sentimentHighlight = "Outstanding Noise Cancellation",
  rating = 5,
  reviewCount = 3450,
  prosSummary = "Excellent NC, Comfortable, Clear Audio",
  negSummary = "6% Neg: Mic Quality",
  fullVerdict
}: AIReviewPillProps) {
  return (
    <div className="w-full flex flex-col mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-[var(--text-muted)] tracking-wide">
          AI Review Summary
        </span>
      </div>

      {/* Sentiment Pill styled with theme tokens */}
      <div className="relative group overflow-hidden rounded-2xl p-[1px] transition-all duration-300">
        <div className="rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/35 hover:border-[var(--primary)]/60 p-2.5 sm:px-3.5 sm:py-2.5 flex items-center justify-between gap-2.5 transition-all duration-300 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Chat Icon Circle */}
            <div className="w-7 h-7 rounded-lg bg-[var(--primary)]/20 text-[var(--primary)] flex items-center justify-center shrink-0 border border-[var(--primary)]/30">
              <MessageSquare className="w-3.5 h-3.5 text-[var(--primary)]" />
            </div>

            {/* Headline Text */}
            <div className="min-w-0">
              <p className="text-[11.5px] sm:text-xs font-bold text-[var(--primary)] leading-tight">
                {sentimentPercentage}% Positive Sentiment{' '}
                <span className="font-normal text-[var(--text-main)] opacity-90">
                  - {sentimentHighlight}
                </span>
              </p>
            </div>
          </div>

          {/* 5 Stars */}
          <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < rating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-400 opacity-40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Breakdown Caption */}
      <p className="text-[11px] text-[var(--text-muted)] mt-2 leading-relaxed">
        Based on {reviewCount.toLocaleString()}+ reviews.{' '}
        <span className="text-[var(--text-main)] opacity-85">{prosSummary}.</span>{' '}
        <span className="text-[var(--text-muted)]">{negSummary}.</span>
      </p>

      {fullVerdict && (
        <p className="text-xs text-[var(--text-muted)] bg-[var(--card-bg)] p-2.5 rounded-xl border border-[var(--border-light)] mt-2">
          💡 {fullVerdict}
        </p>
      )}
    </div>
  )
}
