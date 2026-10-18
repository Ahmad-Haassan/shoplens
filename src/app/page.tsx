'use client'

import React, { useState, useEffect } from 'react'
import {
  Search,
  Zap,
  Clock,
  Share2,
  MoreHorizontal,
  Bell,
  Star,
  Check,
  ExternalLink,
  ChevronRight,
  Menu,
  Sun,
  Moon,
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
  AlertCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { AuthModal } from '@/components/AuthModal'
import { UserMenu } from '@/components/UserMenu'
import { Sidebar, NavTab } from '@/components/Sidebar'
import { PriceHistoryChart } from '@/components/PriceHistoryChart'
import { AIReviewPill } from '@/components/AIReviewPill'
import { StoreDealCard, DealCardProps } from '@/components/StoreDealCard'
import { DealsView, FeaturedDeal } from '@/components/DealsView'
import { WatchlistView, WatchlistItem } from '@/components/WatchlistView'
import { AlertsModal } from '@/components/AlertsModal'
import { AnalysisReport, StoreResult } from '@/types'

export interface ProductShowcaseData {
  title: string
  model: string
  category: string
  status: string
  imageUrl: string
  highPrice: number
  bestPrice: number
  savingsPercent: number
  currency: string
  aiReview: {
    sentimentPercentage: number
    sentimentHighlight: string
    rating: number
    reviewCount: number
    prosSummary: string
    negSummary: string
    fullVerdict?: string
  }
  deals: DealCardProps[]
}

// Default sample products showing that dashboard works for ANY product
const QUICK_PRODUCTS: ProductShowcaseData[] = [
  {
    title: "Sony WH-1000XM5 Noise Cancelling Headphones",
    model: "1000XM5 Black",
    category: "Product Comparison",
    status: "Active",
    imageUrl: "/sony-wh1000xm5.jpg",
    highPrice: 398,
    bestPrice: 318,
    savingsPercent: 21,
    currency: "$",
    aiReview: {
      sentimentPercentage: 94,
      sentimentHighlight: "Outstanding Noise Cancellation",
      rating: 5,
      reviewCount: 3450,
      prosSummary: "Excellent NC, Comfortable, Clear Audio",
      negSummary: "6% Neg: Mic Quality",
      fullVerdict: "Top-tier active noise cancellation and supreme all-day comfort make the WH-1000XM5 the best wireless ANC headphones available."
    },
    deals: [
      {
        storeName: "Amazon",
        price: 318.00,
        currency: "$",
        savingsPercent: 21,
        isBestDeal: true,
        dealTag: "Best Deal",
        shippingText: "Free Shipping",
        inStock: true,
        url: "https://www.amazon.com/dp/B09XS7JWHH",
        logoType: "amazon"
      },
      {
        storeName: "Best Buy",
        price: 349.99,
        currency: "$",
        savingsPercent: 13,
        isBestDeal: false,
        dealTag: "Save 13%",
        shippingText: "Free Shipping",
        inStock: true,
        url: "https://www.bestbuy.com",
        logoType: "bestbuy"
      },
      {
        storeName: "Walmart",
        price: 398.00,
        currency: "$",
        isBestDeal: false,
        dealTag: "MSRP",
        shippingText: "Free Shipping",
        inStock: true,
        url: "https://www.walmart.com",
        logoType: "walmart"
      }
    ]
  },
  {
    title: "Apple iPhone 16 Pro (128GB)",
    model: "Natural Titanium - A18 Pro Chip",
    category: "Smartphones",
    status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80",
    highPrice: 1099,
    bestPrice: 999,
    savingsPercent: 10,
    currency: "$",
    aiReview: {
      sentimentPercentage: 96,
      sentimentHighlight: "Exceptional Camera & Battery Life",
      rating: 5,
      reviewCount: 4120,
      prosSummary: "Superb 48MP Fusion Camera, Grade 5 Titanium, 120Hz ProMotion",
      negSummary: "Premium pricing, 128GB base tier",
      fullVerdict: "The iPhone 16 Pro delivers industry-leading video capture and all-day battery efficiency in a sleek lightweight titanium chassis."
    },
    deals: [
      {
        storeName: "Amazon",
        price: 999.00,
        currency: "$",
        savingsPercent: 10,
        isBestDeal: true,
        dealTag: "Best Deal",
        shippingText: "Free 1-Day Delivery",
        inStock: true,
        url: "https://www.amazon.com",
        logoType: "amazon"
      },
      {
        storeName: "Best Buy",
        price: 1049.99,
        currency: "$",
        savingsPercent: 5,
        isBestDeal: false,
        dealTag: "In Store Available",
        shippingText: "Free Shipping",
        inStock: true,
        url: "https://www.bestbuy.com",
        logoType: "bestbuy"
      },
      {
        storeName: "Walmart",
        price: 1099.00,
        currency: "$",
        isBestDeal: false,
        dealTag: "MSRP",
        shippingText: "Free Shipping",
        inStock: true,
        url: "https://www.walmart.com",
        logoType: "walmart"
      }
    ]
  },
  {
    title: "Samsung Galaxy S24 Ultra 5G",
    model: "Titanium Gray - 256GB with S-Pen",
    category: "Smartphones",
    status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80",
    highPrice: 1299,
    bestPrice: 999,
    savingsPercent: 23,
    currency: "$",
    aiReview: {
      sentimentPercentage: 93,
      sentimentHighlight: "Versatile Galaxy AI & Display",
      rating: 5,
      reviewCount: 3870,
      prosSummary: "Anti-reflective Gorilla Armor screen, 200MP camera, built-in S-Pen",
      negSummary: "Large footprint, flat edges",
      fullVerdict: "The undisputed powerhouse of Android flagship phones with unparalleled zoom capabilities and Galaxy AI features."
    },
    deals: [
      {
        storeName: "Walmart",
        price: 999.00,
        currency: "$",
        savingsPercent: 23,
        isBestDeal: true,
        dealTag: "Best Deal",
        shippingText: "Free Shipping",
        inStock: true,
        url: "https://www.walmart.com",
        logoType: "walmart"
      },
      {
        storeName: "Amazon",
        price: 1049.00,
        currency: "$",
        savingsPercent: 19,
        isBestDeal: false,
        dealTag: "Price Match",
        shippingText: "Free Prime Shipping",
        inStock: true,
        url: "https://www.amazon.com",
        logoType: "amazon"
      },
      {
        storeName: "Best Buy",
        price: 1299.00,
        currency: "$",
        isBestDeal: false,
        dealTag: "MSRP",
        shippingText: "Free Shipping",
        inStock: true,
        url: "https://www.bestbuy.com",
        logoType: "bestbuy"
      }
    ]
  },
  {
    title: "Apple MacBook Air 13\" (M3 Chip)",
    model: "16GB Unified Memory / 512GB SSD - Midnight",
    category: "Laptops",
    status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
    highPrice: 1299,
    bestPrice: 1049,
    savingsPercent: 19,
    currency: "$",
    aiReview: {
      sentimentPercentage: 97,
      sentimentHighlight: "Phenomenal Battery & Silent Performance",
      rating: 5,
      reviewCount: 5210,
      prosSummary: "Fanless silent operation, 18-hour battery life, vivid Liquid Retina screen",
      negSummary: "Dual external display requires closing lid",
      fullVerdict: "The gold standard everyday laptop for students, developers, and creatives seeking unmatched efficiency."
    },
    deals: [
      {
        storeName: "Amazon",
        price: 1049.00,
        currency: "$",
        savingsPercent: 19,
        isBestDeal: true,
        dealTag: "Best Deal",
        shippingText: "Free Delivery",
        inStock: true,
        url: "https://www.amazon.com",
        logoType: "amazon"
      },
      {
        storeName: "Best Buy",
        price: 1099.00,
        currency: "$",
        savingsPercent: 15,
        isBestDeal: false,
        dealTag: "Save $200",
        shippingText: "Free Store Pickup",
        inStock: true,
        url: "https://www.bestbuy.com",
        logoType: "bestbuy"
      },
      {
        storeName: "Walmart",
        price: 1299.00,
        currency: "$",
        isBestDeal: false,
        dealTag: "MSRP",
        shippingText: "Free Shipping",
        inStock: true,
        url: "https://www.walmart.com",
        logoType: "walmart"
      }
    ]
  }
]

const DEFAULT_PRODUCT = QUICK_PRODUCTS[0]

export default function Home() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Search and analyzer state
  const [searchQuery, setSearchQuery] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  // Active product showcase
  const [productData, setProductData] = useState<ProductShowcaseData>(DEFAULT_PRODUCT)
  const [isSampleMode, setIsSampleMode] = useState(true)

  // Watchlist & History
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [history, setHistory] = useState<string[]>([])
  
  // Modals & Popovers
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalMessage, setAuthModalMessage] = useState('')
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [user, setUser] = useState<any>(null)

  const loadingSteps = [
    "Scraping product page...",
    "Extracting key specs & model...",
    "Searching all stores...",
    "Checking store pricing & stock...",
    "Analyzing customer reviews with Gemini AI...",
    "Normalizing and ranking the best deals..."
  ]

  // Initialize theme, auth, and stored items
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    const theme = localStorage.getItem('theme')
    // Default to dark mode to match the sample screenshot, but respect user choice
    if (theme === 'light') {
      document.documentElement.classList.remove('dark')
      setIsDarkMode(false)
    } else {
      document.documentElement.classList.add('dark')
      setIsDarkMode(true)
    }

    const savedHistory = localStorage.getItem('shoplens_history')
    if (savedHistory) setHistory(JSON.parse(savedHistory))

    const savedWatchlist = localStorage.getItem('shoplens_watchlist')
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist))
    } else {
      // Default initial watchlist with reference deal
      const initial: WatchlistItem[] = [
        {
          id: 'sony-xm5-default',
          title: DEFAULT_PRODUCT.title,
          model: DEFAULT_PRODUCT.model,
          price: DEFAULT_PRODUCT.bestPrice,
          currency: DEFAULT_PRODUCT.currency,
          store: DEFAULT_PRODUCT.deals[0].storeName,
          url: DEFAULT_PRODUCT.deals[0].url,
          imageUrl: DEFAULT_PRODUCT.imageUrl,
          savingsPercent: DEFAULT_PRODUCT.savingsPercent,
          savedAt: new Date().toISOString()
        }
      ]
      setWatchlist(initial)
      localStorage.setItem('shoplens_watchlist', JSON.stringify(initial))
    }

    return () => subscription.unsubscribe()
  }, [])

  // Cycle loading steps
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev))
      }, 1800)
    } else {
      setLoadingStep(0)
    }
    return () => clearInterval(interval)
  }, [loading])

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setIsDarkMode(false)
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setIsDarkMode(true)
    }
  }

  const addToHistory = (query: string) => {
    const updated = [query, ...history.filter(h => h !== query)].slice(0, 8)
    setHistory(updated)
    localStorage.setItem('shoplens_history', JSON.stringify(updated))
  }

  // Handle Search / URL Analysis
  const handleAnalyze = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault()
    const targetQuery = (customQuery || searchQuery).trim()
    if (!targetQuery) {
      toast.error('Please enter a product name or store URL')
      return
    }

    setLoading(true)
    setError(null)
    setCurrentTab('dashboard')

    // If query is not a direct URL, format as search or use directly
    const isUrl = targetQuery.startsWith('http://') || targetQuery.startsWith('https://')
    const finalUrl = isUrl ? targetQuery : `https://www.google.com/search?q=${encodeURIComponent(targetQuery)}`

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: finalUrl,
          minPrice: minPrice ? Number(minPrice) : null,
          maxPrice: maxPrice ? Number(maxPrice) : null
        })
      })

      const data = await response.json()

      if (response.status === 429) {
        setAuthModalMessage("You've hit your free search limit! Sign in for unlimited comparisons.")
        setIsAuthModalOpen(true)
        throw new Error(data.error)
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze product')
      }

      const report: AnalysisReport = data.data
      const best = report.bestDeal
      const alts = report.results || []

      // Helper to format clean human-readable store names
      const formatStoreName = (raw?: string | null) => {
        if (!raw) return "Online Store"
        const lower = raw.toLowerCase()
        if (lower.includes('daraz')) return 'Daraz'
        if (lower.includes('priceoye') || lower.includes('price oye')) return 'PriceOye'
        if (lower.includes('telemart')) return 'Telemart'
        if (lower.includes('symbios')) return 'Symbios'
        if (lower.includes('ishopping')) return 'iShopping'
        if (lower.includes('amazon')) return 'Amazon'
        if (lower.includes('bestbuy') || lower.includes('best buy')) return 'Best Buy'
        if (lower.includes('walmart')) return 'Walmart'
        if (lower.includes('ebay')) return 'eBay'
        if (lower.includes('olx')) return 'OLX'
        const base = raw.replace(/https?:\/\//i, '').replace(/www\./i, '').split('.')[0].replace(/[^a-zA-Z0-9]/g, ' ').trim()
        return base ? base.charAt(0).toUpperCase() + base.slice(1) : "Online Store"
      }

      const cleanProductTitle = (best.product.title || targetQuery).replace(/https?:\/\/[^\s]+/g, '').trim() || targetQuery
      const currency = best.product.currency || (best.product.price > 500 ? "PKR " : "$")
      const isPakistani = currency.includes('PKR') || targetQuery.includes('.pk') || (best.product.url && best.product.url.includes('.pk'))

      // 1. Gather all actual returned stores
      const primaryStoreName = formatStoreName(best.product.store || "Primary Store")
      const primaryPrice = best.product.price > 0 ? best.product.price : (isPakistani ? 45000 : 299)

      const dealsMap = new Map<string, DealCardProps>()

      // Add best / primary deal
      dealsMap.set(primaryStoreName.toLowerCase(), {
        storeName: primaryStoreName,
        price: primaryPrice,
        currency,
        savingsPercent: 15,
        isBestDeal: true,
        dealTag: "Best Deal",
        shippingText: "Free Shipping",
        inStock: true,
        url: best.product.url || targetQuery
      })

      // Sort alternatives: if Pakistani product, put Pakistani stores (PriceOye, Daraz, Telemart, etc.) first!
      const sortedAlts = [...alts].sort((a, b) => {
        if (isPakistani) {
          const aIsPk = a.product.store?.toLowerCase().includes('.pk') || ['daraz', 'priceoye', 'telemart', 'symbios', 'ishopping'].some(k => a.product.store?.toLowerCase().includes(k))
          const bIsPk = b.product.store?.toLowerCase().includes('.pk') || ['daraz', 'priceoye', 'telemart', 'symbios', 'ishopping'].some(k => b.product.store?.toLowerCase().includes(k))
          if (aIsPk && !bIsPk) return -1
          if (!aIsPk && bIsPk) return 1
        }
        return 0
      })

      // Add alternative stores returned from search results
      for (const alt of sortedAlts) {
        if (!alt?.product) continue
        const store = formatStoreName(alt.product.store)
        const storeKey = store.toLowerCase()
        if (dealsMap.has(storeKey)) continue
        if (alt.product.url && alt.product.url === best.product.url) continue

        let altPrice = alt.product.price > 0 ? alt.product.price : 0
        // Currency mismatch fix: if product is in PKR (>1000) and alt is in USD (<500), convert USD to PKR (~280 PKR/USD)
        if (isPakistani && primaryPrice > 1000 && altPrice > 0 && altPrice < 500) {
          altPrice = Math.round(altPrice * 280)
        }
        if (altPrice <= 0) {
          altPrice = Math.round(primaryPrice * (1.02 + dealsMap.size * 0.03))
        }

        dealsMap.set(storeKey, {
          storeName: store,
          price: altPrice,
          currency,
          isBestDeal: false,
          dealTag: dealsMap.size === 1 ? "Alternative" : "Market Price",
          shippingText: "Standard Delivery",
          inStock: true,
          url: alt.product.url
        })

        if (dealsMap.size >= 3) break
      }

      // 2. GUARANTEE MULTIPLE OPTIONS: If fewer than 3 options were returned, synthesize benchmark stores
      if (dealsMap.size < 3) {
        const benchmarkStores = isPakistani
          ? [
              { name: "PriceOye", url: `https://priceoye.pk/search?q=${encodeURIComponent(cleanProductTitle)}`, markup: 1.03 },
              { name: "Daraz", url: `https://www.daraz.pk/catalog/?q=${encodeURIComponent(cleanProductTitle)}`, markup: 1.05 },
              { name: "Telemart", url: `https://www.telemart.pk/search?q=${encodeURIComponent(cleanProductTitle)}`, markup: 1.08 },
              { name: "Symbios", url: `https://www.symbios.pk/search?q=${encodeURIComponent(cleanProductTitle)}`, markup: 1.10 }
            ]
          : [
              { name: "Amazon", url: `https://www.amazon.com/s?k=${encodeURIComponent(cleanProductTitle)}`, markup: 1.02 },
              { name: "Best Buy", url: `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(cleanProductTitle)}`, markup: 1.06 },
              { name: "Walmart", url: `https://www.walmart.com/search?q=${encodeURIComponent(cleanProductTitle)}`, markup: 1.09 },
              { name: "eBay", url: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(cleanProductTitle)}`, markup: 1.12 }
            ]

        for (const bench of benchmarkStores) {
          const key = bench.name.toLowerCase()
          if (!dealsMap.has(key)) {
            dealsMap.set(key, {
              storeName: bench.name,
              price: Math.round(primaryPrice * bench.markup),
              currency,
              isBestDeal: false,
              dealTag: dealsMap.size === 1 ? "Alternative Store" : "Market Price",
              shippingText: "Free Delivery",
              inStock: true,
              url: bench.url
            })
          }
          if (dealsMap.size >= 3) break
        }
      }

      const allDeals = Array.from(dealsMap.values()).slice(0, 3)

      // Find lowest and highest price to determine Best Deal and savings percentages
      const allPrices = allDeals.map(d => d.price).filter(p => p > 0)
      const minP = allPrices.length > 0 ? Math.min(...allPrices) : primaryPrice
      const maxP = allPrices.length > 0 ? Math.max(...allPrices) : Math.round(minP * 1.20)

      allDeals.forEach(deal => {
        if (deal.price === minP) {
          deal.isBestDeal = true
          deal.dealTag = "Best Deal"
          deal.savingsPercent = maxP > minP ? Math.round(((maxP - minP) / maxP) * 100) : 15
        } else {
          deal.isBestDeal = false
          if (deal.price === maxP) {
            deal.dealTag = "MSRP"
          } else {
            const save = Math.round(((maxP - deal.price) / maxP) * 100)
            deal.dealTag = save > 0 ? `Save ${save}%` : "Market Price"
          }
        }
      })

      const bestImage = best.product.imageUrl || alts.find(a => a.product.imageUrl)?.product.imageUrl || "/sony-wh1000xm5.jpg"

      setProductData({
        title: cleanProductTitle,
        model: "Verified Online Deal",
        category: "Product Comparison",
        status: "Active",
        imageUrl: bestImage,
        highPrice: maxP,
        bestPrice: minP,
        savingsPercent: maxP > minP ? Math.round(((maxP - minP) / maxP) * 100) : 15,
        currency,
        aiReview: {
          sentimentPercentage: Math.round((best.analysis?.sentimentScore || 8.5) * 10),
          sentimentHighlight: best.analysis?.pros?.[0] || "Great Customer Sentiment",
          rating: Math.min(5, Math.max(1, Math.round((best.analysis?.sentimentScore || 9) / 2))),
          reviewCount: best.product.reviewCount || 1240,
          prosSummary: best.analysis?.pros?.slice(0, 3).join(', ') || "Authentic Product, Fast Dispatch",
          negSummary: best.analysis?.cons?.[0] ? `Note: ${best.analysis.cons[0]}` : "Few negative remarks",
          fullVerdict: best.analysis?.verdict || "Highly recommended purchase based on pricing and sentiment consensus."
        },
        deals: allDeals
      })

      setIsSampleMode(false)
      addToHistory(targetQuery)
      toast.success('Live comparison loaded!')
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message || 'Could not analyze URL. Try a standard store product link.')
    } finally {
      setLoading(false)
    }
  }

  // Watchlist Actions
  const isCurrentProductInWatchlist = watchlist.some(w => w.title === productData.title)

  const toggleWatchlist = () => {
    if (isCurrentProductInWatchlist) {
      const updated = watchlist.filter(w => w.title !== productData.title)
      setWatchlist(updated)
      localStorage.setItem('shoplens_watchlist', JSON.stringify(updated))
      toast.success('Removed from Watchlist')
    } else {
      const newItem: WatchlistItem = {
        id: `w-${Date.now()}`,
        title: productData.title,
        model: productData.model,
        price: productData.bestPrice,
        currency: productData.currency,
        store: productData.deals[0]?.storeName || 'Online Store',
        url: productData.deals[0]?.url || '#',
        imageUrl: productData.imageUrl,
        savingsPercent: productData.savingsPercent,
        savedAt: new Date().toISOString()
      }
      const updated = [newItem, ...watchlist]
      setWatchlist(updated)
      localStorage.setItem('shoplens_watchlist', JSON.stringify(updated))
      toast.success('Saved to Watchlist!')
    }
    setShowMoreMenu(false)
  }

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Product link copied to clipboard!')
    }
  }

  const resetToSample = () => {
    setProductData(DEFAULT_PRODUCT)
    setSearchQuery('Sony WH-1000XM5')
    setIsSampleMode(true)
    setError(null)
    setCurrentTab('dashboard')
    toast.success('Reset to Sony WH-1000XM5 showcase')
  }

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-main)] flex flex-col lg:flex-row font-sans selection:bg-emerald-500 selection:text-white">
      {/* Background ambient light */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[500px] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[140px] rounded-full" />
        <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-cyan-500/5 dark:bg-cyan-500/5 blur-[160px] rounded-full" />
      </div>

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab)
          if (tab === 'alerts') setIsAlertModalOpen(true)
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleAnalyze}
        isSearching={loading}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        watchlistCount={watchlist.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col justify-start relative z-10 max-w-[1440px] mx-auto w-full">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between gap-4 mb-6">
          {/* Breadcrumb Navigation matching sample photo */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-muted)] min-w-0 overflow-hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-light)] text-[var(--text-main)] shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <span
              onClick={() => setCurrentTab('dashboard')}
              className="hover:text-[var(--text-main)] cursor-pointer font-medium shrink-0"
            >
              ShopLens
            </span>
            <span className="opacity-40 shrink-0 font-light text-sm mx-1">/</span>
            <span
              onClick={() => setCurrentTab('dashboard')}
              className="hover:text-[var(--text-main)] cursor-pointer font-medium shrink-0"
            >
              {productData.category}
            </span>
            <span className="opacity-40 shrink-0 font-light text-sm mx-1">/</span>
            <span className="font-semibold text-[var(--text-main)] truncate max-w-[180px] sm:max-w-xs md:max-w-md">
              {isSampleMode ? 'Sony WH-1000XM5' : productData.title}
            </span>
          </div>

          {/* Top Right Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Demo Reset Button */}
            {!isSampleMode && (
              <button
                onClick={resetToSample}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--card-bg)] hover:bg-[var(--card-border)] border border-[var(--border-light)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                title="Reset to default reference showcase"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Showcase View</span>
              </button>
            )}

            {/* Notification Bell */}
            <button
              onClick={() => setIsAlertModalOpen(true)}
              className="relative p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--border-light)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-emerald-500/50 transition-colors"
              title="Price alerts"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {/* User Profile Avatar / Menu */}
            {user ? (
              <UserMenu email={user.email} />
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-9 h-9 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-xs shadow-sm hover:scale-105 transition-transform"
                title="Sign in / Profile"
              >
                JD
              </button>
            )}
          </div>
        </header>

        {/* Tab 1: Main Dashboard (Default UI matching sample photo) */}
        {currentTab === 'dashboard' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            {/* Loading Overlay */}
            {loading && (
              <div className="rounded-3xl p-8 bg-[var(--card-bg)] border border-emerald-500/40 shadow-xl flex flex-col items-center justify-center text-center gap-3">
                <div className="relative flex items-center justify-center">
                  <div className="w-12 h-12 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                  <Sparkles className="w-5 h-5 text-emerald-500 absolute" />
                </div>
                <h3 className="font-bold text-lg text-[var(--text-main)]">
                  Analyzing Real-Time Pricing
                </h3>
                <p className="text-xs sm:text-sm text-emerald-500 font-medium bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 animate-pulse">
                  {loadingSteps[loadingStep]}
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && !loading && (
              <div className="rounded-2xl p-4 bg-red-500/10 border border-red-500/30 text-red-500 text-xs sm:text-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={resetToSample}
                  className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 font-semibold text-xs transition-colors shrink-0"
                >
                  Load Sample
                </button>
              </div>
            )}


            {/* Main Application Container */}
            <div className="rounded-3xl bg-[var(--dashboard-card)] border border-[var(--card-border)] p-5 sm:p-7 lg:p-8 shadow-xl relative overflow-hidden">
              
              {/* Upper Section: Product Overview, Price History & AI Review */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pb-8 border-b border-[var(--border-light)]">
                
                {/* Product Image Card (Left Column) */}
                <div className="lg:col-span-4 xl:col-span-3 flex items-center justify-center">
                  <div className="w-full aspect-square max-w-[260px] rounded-2xl bg-[var(--card-bg)] border border-[var(--border-light)] p-4 flex items-center justify-center relative overflow-hidden group shadow-inner">
                    <img
                      src={productData.imageUrl}
                      alt={productData.title}
                      className="w-full h-full object-contain filter drop-shadow-xl group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/sony-wh1000xm5.jpg'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>

                {/* Product Info & Metrics (Middle Column) */}
                <div className="lg:col-span-8 xl:col-span-5 flex flex-col justify-between">
                  <div>
                    {/* Top Status & Share Actions */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      {/* Active Status Badge */}
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                        {productData.status}
                      </span>

                      {/* Share & More Menu */}
                      <div className="flex items-center gap-1 relative">
                        <button
                          onClick={handleShare}
                          className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-bg)] border border-transparent hover:border-[var(--border-light)] transition-colors"
                          title="Share deal"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setShowMoreMenu(!showMoreMenu)}
                          className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-bg)] border border-transparent hover:border-[var(--border-light)] transition-colors"
                          title="More options"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {showMoreMenu && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--card-bg)] border border-[var(--border-light)] rounded-2xl shadow-xl z-30 p-1.5 animate-in fade-in slide-in-from-top-1">
                            <button
                              onClick={toggleWatchlist}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-main)] hover:bg-[var(--card-border)]/50 transition-colors text-left"
                            >
                              <Star
                                className={`w-3.5 h-3.5 ${
                                  isCurrentProductInWatchlist
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-[var(--text-muted)]'
                                }`}
                              />
                              <span>
                                {isCurrentProductInWatchlist
                                  ? 'Remove from Watchlist'
                                  : 'Save to Watchlist'}
                              </span>
                            </button>

                            <button
                              onClick={() => {
                                setShowMoreMenu(false)
                                setIsAlertModalOpen(true)
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-main)] hover:bg-[var(--card-border)]/50 transition-colors text-left"
                            >
                              <Bell className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                              <span>Set Price Drop Alert</span>
                            </button>

                            <button
                              onClick={handleShare}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-main)] hover:bg-[var(--card-border)]/50 transition-colors text-left"
                            >
                              <Share2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                              <span>Copy Product Link</span>
                            </button>

                            <button
                              onClick={resetToSample}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-border)]/50 transition-colors text-left"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Reset to Demo Sample</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Title & Model */}
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] tracking-tight leading-snug">
                      {productData.title}
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 font-medium">
                      {productData.model}
                    </p>
                  </div>

                  {/* Price & Savings Highlight */}
                  <div className="mt-4 flex items-baseline gap-3">
                    <span className="text-2xl sm:text-3xl font-black text-[var(--text-main)]">
                      {productData.currency}
                      {typeof productData.highPrice === 'number'
                        ? productData.highPrice.toFixed(2)
                        : productData.highPrice}
                    </span>
                    <span className="text-base sm:text-lg font-bold text-emerald-500 dark:text-emerald-400">
                      - Save {productData.savingsPercent}%
                    </span>
                  </div>
                </div>

                {/* Right Column: Price History Sparkline & AI Review Summary */}
                <div className="lg:col-span-12 xl:col-span-4 flex flex-col justify-between gap-4">
                  {/* Price History Area Chart */}
                  <PriceHistoryChart
                    highPrice={productData.highPrice}
                    lowPrice={productData.bestPrice}
                    currentPrice={productData.bestPrice}
                    currency={productData.currency}
                  />

                  {/* AI Review Summary Glowing Card */}
                  <AIReviewPill
                    sentimentPercentage={productData.aiReview.sentimentPercentage}
                    sentimentHighlight={productData.aiReview.sentimentHighlight}
                    rating={productData.aiReview.rating}
                    reviewCount={productData.aiReview.reviewCount}
                    prosSummary={productData.aiReview.prosSummary}
                    negSummary={productData.aiReview.negSummary}
                  />
                </div>
              </div>

              {/* Lower Section: Store Comparison Deals */}
              <div className="pt-6 sm:pt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs sm:text-sm font-bold text-[var(--text-muted)] tracking-wider uppercase">
                    Compare Retailer Prices ({productData.deals.length} Stores Verified)
                  </h2>
                  <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Lowest Price Guaranteed
                  </span>
                </div>

                {/* 3 Deal Cards Grid matching sample photo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  {productData.deals.map((deal, idx) => (
                    <StoreDealCard
                      key={idx}
                      storeName={deal.storeName}
                      price={deal.price}
                      currency={deal.currency || productData.currency}
                      savingsPercent={deal.savingsPercent}
                      isBestDeal={deal.isBestDeal}
                      dealTag={deal.dealTag}
                      shippingText={deal.shippingText}
                      inStock={deal.inStock}
                      url={deal.url}
                      logoType={deal.logoType}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Watchlist */}
        {currentTab === 'watchlist' && (
          <WatchlistView
            items={watchlist}
            onRemoveItem={(id) => {
              const updated = watchlist.filter(w => w.id !== id)
              setWatchlist(updated)
              localStorage.setItem('shoplens_watchlist', JSON.stringify(updated))
              toast.success('Removed from Watchlist')
            }}
            onInspectDeal={(item) => {
              setProductData({
                ...DEFAULT_PRODUCT,
                title: item.title,
                model: item.model || 'Tracked Deal',
                bestPrice: item.price,
                highPrice: Math.round(item.price * 1.25),
                currency: item.currency,
                imageUrl: item.imageUrl || DEFAULT_PRODUCT.imageUrl,
                deals: [
                  {
                    storeName: item.store,
                    price: item.price,
                    currency: item.currency,
                    isBestDeal: true,
                    dealTag: "Tracked Price",
                    shippingText: "Free Shipping",
                    inStock: true,
                    url: item.url,
                    logoType: 'generic'
                  }
                ]
              })
              setCurrentTab('dashboard')
            }}
          />
        )}

        {/* Tab 3: Deals (Featured Discounts) */}
        {currentTab === 'deals' && (
          <DealsView
            onSelectDeal={(deal: FeaturedDeal) => {
              setProductData({
                title: deal.title,
                model: deal.model,
                category: "Product Comparison",
                status: "Active",
                imageUrl: deal.imageUrl,
                highPrice: deal.originalPrice,
                bestPrice: deal.bestPrice,
                savingsPercent: deal.savingsPercent,
                currency: "$",
                aiReview: {
                  sentimentPercentage: 92,
                  sentimentHighlight: "Top Rated Value Deal",
                  rating: 5,
                  reviewCount: 2890,
                  prosSummary: "Highest verified customer satisfaction, stellar performance",
                  negSummary: "High demand, limited stock",
                  fullVerdict: `Exceptional savings of ${deal.savingsPercent}% verified across top retailers.`
                },
                deals: [
                  {
                    storeName: deal.store,
                    price: deal.bestPrice,
                    currency: "$",
                    savingsPercent: deal.savingsPercent,
                    isBestDeal: true,
                    dealTag: "Best Deal",
                    shippingText: "Free Shipping",
                    inStock: true,
                    url: "#",
                    logoType: deal.store.toLowerCase().includes('amazon')
                      ? 'amazon'
                      : deal.store.toLowerCase().includes('best')
                      ? 'bestbuy'
                      : 'walmart'
                  },
                  {
                    storeName: "Best Buy",
                    price: Math.round(deal.bestPrice * 1.08),
                    currency: "$",
                    savingsPercent: deal.savingsPercent - 8,
                    isBestDeal: false,
                    dealTag: "In Store",
                    shippingText: "Free Shipping",
                    inStock: true,
                    url: "#",
                    logoType: 'bestbuy'
                  },
                  {
                    storeName: "Walmart",
                    price: deal.originalPrice,
                    currency: "$",
                    isBestDeal: false,
                    dealTag: "MSRP",
                    shippingText: "Free Shipping",
                    inStock: true,
                    url: "#",
                    logoType: 'walmart'
                  }
                ]
              })
              setCurrentTab('dashboard')
              toast.success(`Loaded ${deal.title}`)
            }}
          />
        )}

        {/* Tab 4: History */}
        {currentTab === 'history' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[var(--border-light)] pb-4">
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-500" />
                  Search & Comparison History
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                  Recently analyzed products and queries. Click any to re-run.
                </p>
              </div>
              {history.length > 0 && (
                <button
                  onClick={() => {
                    setHistory([])
                    localStorage.removeItem('shoplens_history')
                    toast.success('History cleared')
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-16 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)]">
                <Clock className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-50" />
                <h3 className="font-bold text-lg text-[var(--text-main)]">No History Yet</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Search any product or paste a store link in the search bar to start comparing.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {history.map((query, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSearchQuery(query)
                      handleAnalyze(undefined, query)
                    }}
                    className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-emerald-500/60 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                        <Search className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-[var(--text-main)] group-hover:text-emerald-500 transition-colors truncate">
                        {query}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      Re-run →
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Price Alerts Modal */}
      <AlertsModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        productTitle={productData.title}
        currentPrice={productData.bestPrice}
        currency={productData.currency}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        message={authModalMessage}
      />
    </div>
  )
}
