'use client'

import React from 'react'
import { ExternalLink, Tag, Sparkles } from 'lucide-react'

export interface DealCardProps {
  storeName: string
  price: number
  currency?: string
  originalPrice?: number
  savingsPercent?: number
  isBestDeal?: boolean
  dealTag?: string
  shippingText?: string
  inStock?: boolean
  url: string
  logoType?: 'amazon' | 'bestbuy' | 'walmart' | 'daraz' | 'priceoye' | 'telemart' | 'shopify' | 'olx' | 'ebay' | 'generic'
}

export function StoreDealCard({
  storeName,
  price,
  currency = '$',
  savingsPercent,
  isBestDeal = false,
  dealTag,
  shippingText = "Free Shipping",
  inStock = true,
  url,
  logoType
}: DealCardProps) {
  // Infer logo if not explicitly set
  const inferredLogo = logoType || (() => {
    const s = storeName.toLowerCase()
    if (s.includes('amazon')) return 'amazon'
    if (s.includes('best buy') || s.includes('bestbuy')) return 'bestbuy'
    if (s.includes('walmart')) return 'walmart'
    if (s.includes('daraz')) return 'daraz'
    if (s.includes('priceoye') || s.includes('price oye')) return 'priceoye'
    if (s.includes('telemart')) return 'telemart'
    if (s.includes('ebay')) return 'ebay'
    if (s.includes('shopify') || s.includes('myshopify')) return 'shopify'
    if (s.includes('olx')) return 'olx'
    return 'generic'
  })()

  const renderStoreIcon = () => {
    switch (inferredLogo) {
      case 'amazon':
        return (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xl italic font-serif">
            <span className="text-[var(--text-main)]">a</span>
          </div>
        )
      case 'bestbuy':
        return (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <div className="w-6 h-4 bg-amber-400 rounded-sm -rotate-12 flex items-center justify-center shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1A1817]"></span>
            </div>
          </div>
        )
      case 'walmart':
        return (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-amber-400 fill-amber-400" />
          </div>
        )
      case 'daraz':
        return (
          <div className="w-8 h-8 rounded-lg bg-orange-500/15 text-orange-500 flex items-center justify-center font-black text-sm border border-orange-500/30">
            d
          </div>
        )
      case 'priceoye':
        return (
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-500 flex items-center justify-center font-black text-xs border border-cyan-500/30 tracking-tight">
            P·O
          </div>
        )
      case 'telemart':
        return (
          <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-500 flex items-center justify-center font-black text-xs border border-rose-500/30">
            TM
          </div>
        )
      case 'ebay':
        return (
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-500 flex items-center justify-center font-black text-xs border border-blue-500/30">
            ebay
          </div>
        )
      case 'shopify':
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
            SHOPIFY
          </div>
        )
      case 'olx':
        return (
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-500 flex items-center justify-center font-bold text-xs border border-blue-500/30">
            OLX
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center">
            <Tag className="w-4 h-4" />
          </div>
        )
    }
  }

  const formattedPrice = typeof price === 'number'
    ? price % 1 !== 0
      ? price.toFixed(2)
      : price.toLocaleString()
    : price

  return (
    <div
      className={`relative rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 ${
        isBestDeal
          ? 'border-2 border-[var(--primary)] bg-[var(--primary)]/10 dark:bg-[var(--primary)]/15 shadow-md'
          : 'bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--border-light)]'
      }`}
    >
      <div>
        {/* Store Icon & Name */}
        <div className="flex items-center gap-2 mb-3">
          {renderStoreIcon()}
        </div>

        <div className="mb-2">
          <h3 className="font-bold text-base text-[var(--text-main)] flex items-center justify-between">
            <span>{storeName}</span>
          </h3>
          {isBestDeal ? (
            <p className="text-xs font-bold text-[var(--primary)] mt-0.5">Best Deal</p>
          ) : dealTag ? (
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{dealTag}</p>
          ) : null}
        </div>

        {/* Price & Savings */}
        <div className="mt-3">
          <p className="text-2xl font-black text-[var(--text-main)] tracking-tight">
            {currency}{formattedPrice}
          </p>
          {savingsPercent ? (
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              Save {savingsPercent}%
            </p>
          ) : dealTag === 'MSRP' ? (
            <p className="text-xs text-[var(--text-muted)] mt-0.5">MSRP</p>
          ) : null}
        </div>

        {/* Shipping & Stock */}
        <div className="mt-4 space-y-1 text-xs text-[var(--text-muted)]">
          <p>{shippingText}</p>
          {inStock && (
            <p className="text-emerald-600 dark:text-emerald-400 font-semibold">In Stock</p>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-6">
        <a
          href={url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ${
            isBestDeal
              ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-xs'
              : 'bg-[var(--bg-color)] text-[var(--text-main)] border border-[var(--border-light)] hover:bg-[var(--card-border)]'
          }`}
        >
          <span>Go to Deal</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </a>
      </div>
    </div>
  )
}
