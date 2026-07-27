'use client'

import React, { useState, useEffect } from 'react'
import { Search, Zap, Clock } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Navbar } from '@/components/Navbar'
import { AuthModal } from '@/components/AuthModal'
import { FeaturesGrid } from '@/components/FeaturesGrid'
import { HowItWorks } from '@/components/HowItWorks'
import { SkeletonLoader } from '@/components/SkeletonLoader'
import { StoreResult, AnalysisReport } from '@/types'
import { Star, ShieldCheck } from 'lucide-react'

export default function Home() {
  const [url, setUrl] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [result, setResult] = useState<AnalysisReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [history, setHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalMessage, setAuthModalMessage] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('shoplens_history')
    if (saved) setHistory(JSON.parse(saved))
  }, [])

  const addToHistory = (searchUrl: string) => {
    const updated = [searchUrl, ...history.filter(h => h !== searchUrl)].slice(0, 5)
    setHistory(updated)
    localStorage.setItem('shoplens_history', JSON.stringify(updated))
  }

  const loadingSteps = [
    "Scraping product page...",
    "Extracting key specs & model...",
    "Searching all Pakistani stores...",
    "Checking Google Shopping...",
    "Analyzing reviews with Gemini...",
    "Ranking the best deals..."
  ]

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev))
      }, 2000)
    } else {
      setLoadingStep(0)
    }
    return () => clearInterval(interval)
  }, [loading])

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url, 
          minPrice: minPrice ? Number(minPrice) : null, 
          maxPrice: maxPrice ? Number(maxPrice) : null 
        })
      })
      
      const data = await response.json()
      
      if (response.status === 429) {
        setAuthModalMessage("You've hit your free search limit! Sign in for more searches.")
        setIsAuthModalOpen(true)
        throw new Error(data.error)
      }

      if (!response.ok) throw new Error(data.error || 'Failed to analyze')
      
      setResult(data.data)
      addToHistory(url)
      toast.success('Analysis complete!')
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex-1 w-full bg-[var(--bg-color)] text-[var(--text-main)] relative overflow-hidden">
      {/* Background Grid & Glows */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#D2B48C]/10 blur-[120px] rounded-full pointer-events-none" />

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center animate-slide-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6F4E37]/10 border border-[#6F4E37]/20 text-[#6F4E37] text-sm font-medium mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6F4E37] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6F4E37]"></span>
          </span>
          Live Search — Daraz · Shopify · OLX across Pakistan
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl text-[var(--text-main)]">
          Shop Smarter. <br />
          <span className="glowing-text">Pay Less.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-[var(--text-muted)] mb-10 max-w-2xl">
          Paste any product URL. We'll instantly compare prices across Pakistan, analyze reviews using AI, and find the absolute best deal for you.
        </p>

        {/* URL Input Form */}
        <form onSubmit={handleAnalyze} className="w-full max-w-3xl relative mb-20">
          <div className="relative group mb-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#6F4E37] to-[#A07855] rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative glass-card p-2 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type="url"
                  placeholder="Paste any Daraz, Shopify, OLX or store URL..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onFocus={() => setShowHistory(true)}
                  onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                  className="w-full bg-transparent border-none outline-none text-[var(--text-main)] placeholder-[var(--text-muted)] py-4 pl-12 pr-4 text-lg"
                  required
                />
                
                {/* Search History Dropdown */}
                {showHistory && history.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-[var(--card-bg)] border border-[var(--border-light)] rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-2 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-color)]">Recent Searches</div>
                    {history.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-color)] cursor-pointer text-sm text-[var(--text-main)] transition-colors"
                        onClick={() => setUrl(item)}
                      >
                        <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" disabled={loading} className="primary-btn sm:w-auto w-full py-4 px-8 text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Analyzing...
                  </div>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Analyze
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="flex gap-4 max-w-sm mx-auto mb-6">
             <div className="flex-1 relative">
                <input type="number" placeholder="Min Price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full bg-[var(--card-bg)] border border-[var(--border-light)] rounded-xl py-2 px-4 text-[var(--text-main)] outline-none focus:border-[#6F4E37] transition-colors" />
             </div>
             <div className="flex-1 relative">
                <input type="number" placeholder="Max Price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full bg-[var(--card-bg)] border border-[var(--border-light)] rounded-xl py-2 px-4 text-[var(--text-main)] outline-none focus:border-[#6F4E37] transition-colors" />
             </div>
          </div>

          {/* Loading Steps indicator moved here so it doesn't overlap */}
          {loading && (
            <div className="flex justify-center animate-fade-in mb-4">
              <p className="text-sm font-medium text-[#6F4E37] bg-[#6F4E37]/10 px-4 py-2 rounded-full border border-[#6F4E37]/20 flex items-center gap-2">
                <span className="w-2 h-2 bg-[#6F4E37] rounded-full animate-pulse"></span>
                {loadingSteps[loadingStep]}
              </p>
            </div>
          )}
        </form>

        {/* Loading Skeleton */}
        {loading && <SkeletonLoader />}

        {/* Results Section */}
        {error && !loading && (
          <div className="w-full max-w-3xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800/50 mb-20 text-left">
            <p className="font-semibold flex items-center gap-2"><Zap className="w-4 h-4"/> Error</p>
            <p>{error}</p>
          </div>
        )}

        {result && result.bestDeal && !loading && (
          <div className="w-full max-w-3xl glass-card bg-white p-6 rounded-2xl mb-20 text-left border border-[var(--border-light)] animate-slide-up">
            
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold border border-green-200">
                <Zap className="w-4 h-4" /> Top Recommendation
              </div>
              {result.results && result.results.length > 1 && (
                <span className="text-sm text-[var(--text-muted)]">
                  {result.results.length} result{result.results.length !== 1 ? 's' : ''} found
                </span>
              )}
            </div>

            <div className="flex items-start justify-between border-b border-[var(--border-light)] pb-4 mb-4 gap-4">
              <div className="flex-1 min-w-0">
                {result.bestDeal.product.imageUrl && (
                  <img
                    src={result.bestDeal.product.imageUrl}
                    alt={result.bestDeal.product.title}
                    className="w-24 h-24 object-cover rounded-xl border border-[var(--border-light)] mb-3"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <h3 className="text-2xl font-bold text-[var(--text-main)] mb-1 leading-snug">{result.bestDeal.product.title}</h3>
                <p className="text-[var(--text-muted)] text-sm mb-2">Store: <span className="font-semibold text-[var(--text-main)]">{result.bestDeal.product.store}</span></p>
                {result.bestDeal.reasoning && (
                  <div className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-lg border border-blue-100">
                    💡 {result.bestDeal.reasoning}
                  </div>
                )}
              </div>
              <div className="text-right flex flex-col items-end shrink-0">
                <p className="text-3xl font-extrabold text-[#6F4E37]">
                  {result.bestDeal.product.price > 0
                    ? `${result.bestDeal.product.currency} ${Math.round(result.bestDeal.product.price).toLocaleString()}`
                    : ''}
                </p>
                <a href={result.bestDeal.product.url} target="_blank" rel="noopener noreferrer" className="mt-2 text-sm font-semibold text-white bg-[#6F4E37] hover:bg-[#A07855] px-4 py-1.5 rounded-full transition-colors flex items-center gap-1">
                  View Deal <Zap className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--border-light)]">
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[#6F4E37]"/> AI Verdict</h4>
              <p className="text-[var(--text-main)] bg-[var(--bg-color)] p-4 rounded-xl border border-[var(--border-light)] text-sm leading-relaxed">
                {result.bestDeal.analysis.verdict}
              </p>
            </div>

            {/* Alternative Comparisons */}
            {result.results && result.results.length > 1 && (
              <div className="mt-8 pt-6 border-t border-[var(--border-light)]">
                <h4 className="font-semibold text-lg mb-4 text-[var(--text-main)] flex items-center gap-2">
                  <Search className="w-5 h-5 text-[#6F4E37]"/>
                  All Alternatives ({result.results.filter((r: any) => r.product.url !== result.bestDeal.product.url).length})
                </h4>
                <div className="flex flex-col gap-3">
                  {result.results
                    .filter((r: any) => r.product.url !== result.bestDeal.product.url)
                    .map((r: any, idx: number) => (
                      <details key={idx} className="group p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-light)] hover:border-[#6F4E37]/50 transition-all duration-300 cursor-pointer overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                        <summary className="flex items-center justify-between outline-none list-none">
                          <div className="flex-1 pr-4 min-w-0">
                            <p className="font-semibold text-base text-[var(--text-main)] group-hover:text-[#6F4E37] transition-colors flex items-center gap-2 flex-wrap">
                              {r.product.store}
                              {(r.product.store.includes('myshopify') || r.product.store.includes('shopify')) && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 tracking-wider uppercase">Shopify</span>
                              )}
                              {r.product.store.includes('olx') && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 tracking-wider uppercase">OLX</span>
                              )}
                              {r.product.store.includes('daraz') && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 tracking-wider uppercase">Daraz</span>
                              )}
                            </p>
                            <p className="text-sm text-[var(--text-muted)] truncate max-w-[220px] sm:max-w-md mt-1">{r.product.title}</p>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1 shrink-0">
                            <p className="font-extrabold text-lg text-[#6F4E37]">
                              {r.product.price > 0 ? `PKR ${Math.round(r.product.price).toLocaleString()}` : ''}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] group-hover:text-[#6F4E37] transition-colors">
                              <span>View Details</span>
                              <svg className="w-3 h-3 transform transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                          </div>
                        </summary>
                        
                        <div className="mt-4 pt-4 border-t border-[var(--border-light)] flex flex-col gap-4 animate-slide-up">
                          {/* Product image if available */}
                          {r.product.imageUrl && (
                            <img
                              src={r.product.imageUrl}
                              alt={r.product.title}
                              className="w-20 h-20 object-cover rounded-lg border border-[var(--border-light)]"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          )}
                          <div className="bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border-light)]">
                            <p className="text-sm text-[var(--text-muted)]">
                              <span className="font-bold text-[var(--text-main)] flex items-center gap-2 mb-1"><Star className="w-4 h-4 text-[#D4A373]"/> Summary</span>
                              {r.analysis.verdict}
                            </p>
                          </div>
                          
                          {r.analysis.features && r.analysis.features.length > 0 && (
                            <div>
                              <span className="font-bold text-[var(--text-main)] text-sm flex items-center gap-2 mb-2"><ShieldCheck className="w-4 h-4 text-[#7F9183]"/> Store Features</span>
                              <div className="flex gap-2 flex-wrap">
                                {r.analysis.features.map((feature: string, fIdx: number) => (
                                  <span key={fIdx} className="text-xs px-3 py-1.5 bg-[#6F4E37]/5 text-[#6F4E37] font-semibold rounded-lg border border-[#6F4E37]/10">
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex justify-end mt-1">
                            <a href={r.product.url} target="_blank" rel="noopener noreferrer" className="primary-btn text-sm px-6 py-2 flex items-center gap-2 font-semibold">
                              Visit Store <Zap className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </details>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <FeaturesGrid />
      <HowItWorks />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        message={authModalMessage}
      />

      {/* Footer */}
      <footer className="border-t border-[var(--border-light)] bg-[var(--bg-color)] py-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-[var(--text-muted)]">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-md bg-[#6F4E37]/10 flex items-center justify-center">
              <Search className="w-4 h-4 text-[#6F4E37]" />
            </div>
            <span className="font-bold text-[var(--text-main)]">ShopLens AI</span>
          </div>
          <p>© {new Date().getFullYear()} ShopLens AI. Built for Pakistan 🇵🇰</p>
        </div>
      </footer>
    </main>
  )
}
