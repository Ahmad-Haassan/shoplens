'use client'

import React from 'react'
import { Star, ExternalLink, Trash2, ArrowRight } from 'lucide-react'

export interface WatchlistItem {
  id: string
  title: string
  model?: string
  price: number
  currency: string
  store: string
  url: string
  imageUrl?: string | null
  savingsPercent?: number
  savedAt: string
}

interface WatchlistViewProps {
  items: WatchlistItem[]
  onRemoveItem: (id: string) => void
  onInspectDeal: (item: WatchlistItem) => void
}

export function WatchlistView({ items, onRemoveItem, onInspectDeal }: WatchlistViewProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 px-4 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-amber-400/15 text-amber-500 mx-auto flex items-center justify-center mb-4">
          <Star className="w-8 h-8 fill-amber-400/30" />
        </div>
        <h3 className="text-xl font-bold text-[var(--text-main)]">Your Watchlist is Empty</h3>
        <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto mt-2">
          Click the star icon or options menu on any product comparison to save deals here for easy tracking.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-[var(--border-light)] pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            Watchlist ({items.length})
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Tracked products and price monitors.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-emerald-500/50 p-4 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex gap-3 items-center mb-3">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-xl bg-black/10 shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-lg shrink-0">
                    SL
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-emerald-500 tracking-wider uppercase">
                    {item.store}
                  </span>
                  <h3 className="text-sm font-bold text-[var(--text-main)] truncate mt-0.5">
                    {item.title}
                  </h3>
                  {item.model && (
                    <p className="text-xs text-[var(--text-muted)] truncate">{item.model}</p>
                  )}
                </div>
              </div>

              <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-[var(--border-light)]">
                <div>
                  <p className="text-xl font-extrabold text-[var(--text-main)]">
                    {item.currency} {Math.round(item.price).toLocaleString()}
                  </p>
                  {item.savingsPercent ? (
                    <p className="text-xs font-semibold text-emerald-500">
                      Save {item.savingsPercent}%
                    </p>
                  ) : null}
                </div>
                <span className="text-[10px] text-[var(--text-muted)]">
                  Saved {new Date(item.savedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[var(--border-light)]">
              <button
                onClick={() => onInspectDeal(item)}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-[var(--bg-color)] border border-[var(--border-light)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                title="Go to store"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => onRemoveItem(item.id)}
                className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                title="Remove from watchlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
