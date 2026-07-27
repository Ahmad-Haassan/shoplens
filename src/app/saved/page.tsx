'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bookmark, ExternalLink, Trash2, Search, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface SavedDeal {
  id: string
  product_title: string
  product_url: string
  product_store: string
  product_price: number
  product_currency: string
  product_image_url: string | null
  ai_verdict: string | null
  saved_at: string
}

export default function SavedDealsPage() {
  const [deals, setDeals] = useState<SavedDeal[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }
      setUser(user)

      const { data, error } = await supabase
        .from('saved_deals')
        .select('*')
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false })

      if (error) toast.error('Failed to load saved deals')
      else setDeals(data || [])
      setLoading(false)
    }

    fetchData()
  }, [])

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('saved_deals')
      .delete()
      .eq('id', id)

    if (error) toast.error('Failed to remove deal')
    else {
      setDeals(prev => prev.filter(d => d.id !== id))
      toast.success('Deal removed')
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg-color)] text-[var(--text-main)]">
      {/* Header */}
      <div className="border-b border-[var(--border-light)] bg-[var(--card-bg)] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to ShopLens</span>
          </Link>
          <div className="w-px h-5 bg-[var(--border-light)]" />
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#6F4E37]" />
            <h1 className="font-bold text-lg text-[var(--text-main)]">Saved Deals</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton h-40 rounded-2xl" />
            ))}
          </div>
        ) : deals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-full bg-[#6F4E37]/10 flex items-center justify-center mb-6 border border-[#6F4E37]/20">
              <Bookmark className="w-8 h-8 text-[#6F4E37]/50" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-main)] mb-3">No saved deals yet</h2>
            <p className="text-[var(--text-muted)] mb-8 max-w-sm">Search for a product and click the bookmark icon on any result card to save it here.</p>
            <Link href="/" className="primary-btn px-6 py-3 flex items-center gap-2 font-semibold">
              <Search className="w-4 h-4" /> Start Searching
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-[var(--text-muted)] text-sm">{deals.length} deal{deals.length !== 1 ? 's' : ''} saved</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {deals.map(deal => (
                <div key={deal.id} className="glass-card bg-white p-5 rounded-2xl border border-[var(--border-light)] hover:shadow-md transition-all group">
                  <div className="flex items-start gap-4">
                    {deal.product_image_url ? (
                      <img
                        src={deal.product_image_url}
                        alt={deal.product_title}
                        className="w-16 h-16 object-cover rounded-xl border border-[var(--border-light)] shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-[#6F4E37]/10 flex items-center justify-center shrink-0 border border-[var(--border-light)]">
                        <Bookmark className="w-6 h-6 text-[#6F4E37]/50" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[var(--text-main)] text-sm leading-tight mb-1 line-clamp-2">{deal.product_title}</p>
                      <p className="text-xs text-[var(--text-muted)] mb-2">{deal.product_store}</p>
                      <p className="text-xl font-extrabold text-[#6F4E37]">
                        {deal.product_price > 0 ? `${deal.product_currency} ${Math.round(deal.product_price).toLocaleString()}` : 'Price N/A'}
                      </p>
                    </div>
                  </div>

                  {deal.ai_verdict && (
                    <p className="mt-3 text-xs text-[var(--text-muted)] bg-[var(--bg-color)] p-3 rounded-xl border border-[var(--border-light)] line-clamp-2">
                      {deal.ai_verdict}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-xs text-[var(--text-muted)]">
                      Saved {new Date(deal.saved_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(deal.id)}
                        className="p-2 rounded-lg hover:bg-red-50 hover:text-red-500 text-[var(--text-muted)] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <a
                        href={deal.product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="primary-btn text-xs px-4 py-2 flex items-center gap-1 font-semibold"
                      >
                        View Deal <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
