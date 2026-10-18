'use client'

import React from 'react'
import { Tag, ArrowUpRight, TrendingDown, Sparkles } from 'lucide-react'

export interface FeaturedDeal {
  id: string
  title: string
  model: string
  category: string
  originalPrice: number
  bestPrice: number
  savingsPercent: number
  store: string
  imageUrl: string
  searchQuery: string
  badge?: string
}

export const FEATURED_DEALS: FeaturedDeal[] = [
  {
    id: 'sony-xm5',
    title: 'Sony WH-1000XM5 Noise Cancelling Headphones',
    model: '1000XM5 Black',
    category: 'Audio',
    originalPrice: 398,
    bestPrice: 318,
    savingsPercent: 21,
    store: 'Amazon',
    imageUrl: '/sony-wh1000xm5.jpg',
    searchQuery: 'Sony WH-1000XM5',
    badge: 'Trending #1'
  },
  {
    id: 'apple-airpods-max',
    title: 'Apple AirPods Max (USB-C)',
    model: 'Space Gray',
    category: 'Audio',
    originalPrice: 549,
    bestPrice: 479,
    savingsPercent: 13,
    store: 'Best Buy',
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
    searchQuery: 'Apple AirPods Max',
    badge: 'Popular'
  },
  {
    id: 'macbook-air-m3',
    title: 'Apple MacBook Air 13" M3 Chip',
    model: '16GB / 512GB Midnight',
    category: 'Computers',
    originalPrice: 1299,
    bestPrice: 1049,
    savingsPercent: 19,
    store: 'Amazon',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    searchQuery: 'MacBook Air M3',
    badge: 'Price Drop'
  },
  {
    id: 'samsung-s24-ultra',
    title: 'Samsung Galaxy S24 Ultra 5G',
    model: 'Titanium Gray 256GB',
    category: 'Smartphones',
    originalPrice: 1299,
    bestPrice: 999,
    savingsPercent: 23,
    store: 'Walmart',
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80',
    searchQuery: 'Samsung Galaxy S24 Ultra',
    badge: 'Huge Savings'
  }
]

interface DealsViewProps {
  onSelectDeal: (deal: FeaturedDeal) => void
}

export function DealsView({ onSelectDeal }: DealsViewProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-light)] pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-500" />
            Featured Deals & Price Drops
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Real-time verified discounts and steepest price drops across major retailers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURED_DEALS.map((deal) => (
          <div
            key={deal.id}
            onClick={() => onSelectDeal(deal)}
            className="group cursor-pointer rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-emerald-500/60 p-4 transition-all duration-200 flex flex-col justify-between hover:shadow-lg"
          >
            <div>
              <div className="relative w-full h-40 rounded-xl overflow-hidden bg-black/5 dark:bg-black/30 mb-3 flex items-center justify-center">
                <img
                  src={deal.imageUrl}
                  alt={deal.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {deal.badge && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-xs">
                    {deal.badge}
                  </span>
                )}
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/70 text-white backdrop-blur-xs">
                  {deal.store}
                </span>
              </div>

              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                {deal.category}
              </span>
              <h3 className="text-sm font-bold text-[var(--text-main)] line-clamp-2 mt-0.5 group-hover:text-emerald-500 transition-colors">
                {deal.title}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{deal.model}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border-light)] flex items-center justify-between">
              <div>
                <p className="text-base font-extrabold text-[var(--text-main)]">
                  ${deal.bestPrice}
                </p>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="line-through text-[var(--text-muted)] text-[11px]">
                    ${deal.originalPrice}
                  </span>
                  <span className="text-emerald-500 font-semibold text-[11px]">
                    -{deal.savingsPercent}%
                  </span>
                </div>
              </div>

              <button className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
