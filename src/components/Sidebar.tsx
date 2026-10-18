'use client'

import React from 'react'
import {
  LayoutGrid,
  Star,
  Tag,
  History,
  Bell,
  Search,
  Moon,
  Sun,
  X
} from 'lucide-react'

export type NavTab = 'dashboard' | 'watchlist' | 'deals' | 'history' | 'alerts'

interface SidebarProps {
  currentTab: NavTab
  onSelectTab: (tab: NavTab) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  onSearchSubmit: (e: React.FormEvent) => void
  isSearching?: boolean
  isDarkMode: boolean
  onToggleTheme: () => void
  isOpenMobile?: boolean
  onCloseMobile?: () => void
  watchlistCount?: number
}

export function Sidebar({
  currentTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  isSearching = false,
  isDarkMode,
  onToggleTheme,
  isOpenMobile = false,
  onCloseMobile,
  watchlistCount = 0
}: SidebarProps) {
  const navItems: { id: NavTab; label: string; icon: any; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'watchlist', label: 'Watchlist', icon: Star, badge: watchlistCount > 0 ? watchlistCount : undefined },
    { id: 'deals', label: 'Deals', icon: Tag },
    { id: 'history', label: 'History', icon: History },
    { id: 'alerts', label: 'Alerts', icon: Bell },
  ]

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 shrink-0 bg-[var(--sidebar-bg)] border-r border-[var(--card-border)] flex flex-col justify-between p-5 z-50 transition-transform duration-300 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-6">
          {/* Logo Header */}
          <div className="flex items-center justify-between">
            <div
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              {/* SL Badge */}
              <div className="w-9 h-9 rounded-xl bg-[#6F4E37] text-white dark:bg-[#D2B48C] dark:text-[#1A1817] font-black text-sm flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
                SL
              </div>
              <span className="font-extrabold text-xl tracking-tight text-[var(--text-main)]">
                ShopLens
              </span>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-border)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Box */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-1">
              Search
            </label>
            <form onSubmit={onSearchSubmit} className="relative group">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Paste URL or product name..."
                  className="w-full bg-[var(--bg-color)] border border-[var(--border-light)] rounded-xl py-2.5 pl-10 pr-8 text-xs sm:text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/30 transition-all shadow-xs"
                />
                {isSearching && (
                  <div className="absolute right-3 w-3.5 h-3.5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
            </form>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentTab === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id)
                    if (onCloseMobile) onCloseMobile()
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group text-left ${
                    isActive
                      ? 'bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/40 font-semibold shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-border)]/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? 'text-[var(--primary)]'
                          : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--primary)]/20 text-[var(--primary)]">
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Footer Area with Theme Toggle */}
        <div className="pt-4 border-t border-[var(--card-border)] flex flex-col gap-3">
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-border)]/50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[var(--primary)]" />
              )}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[var(--card-bg)] border border-[var(--border-light)]">
              {isDarkMode ? 'Dark' : 'Light'}
            </span>
          </button>

          <div className="px-1 flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Scrapers Online</span>
          </div>
        </div>
      </aside>
    </>
  )
}
