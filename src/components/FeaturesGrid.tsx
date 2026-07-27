import React from 'react';
import { TrendingDown, Star, ShieldCheck, LineChart, Zap, Search } from 'lucide-react';

export function FeaturesGrid() {
  const features = [
    {
      icon: <TrendingDown className="w-6 h-6 text-[#6F4E37]" />,
      title: "Price Comparison",
      desc: "We search Daraz, Shopify, and local stores to find the absolute lowest price."
    },
    {
      icon: <Star className="w-6 h-6 text-[#D4A373]" />,
      title: "AI Review Analysis",
      desc: "Don't read 100s of reviews. Our AI summarizes pros, cons, and detects fake reviews."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#7F9183]" />,
      title: "Seller Verification",
      desc: "We check seller reputation, return policies, and stock availability."
    },
    {
      icon: <LineChart className="w-6 h-6 text-[#9A8C98]" />,
      title: "Price History",
      desc: "See if you're buying at the right time or if the price was cheaper last month."
    },
    {
      icon: <Zap className="w-6 h-6 text-[#E07A5F]" />,
      title: "Instant Results",
      desc: "Get a comprehensive analysis report in seconds, not hours of manual searching."
    },
    {
      icon: <Search className="w-6 h-6 text-[#8D99AE]" />,
      title: "Universal Search",
      desc: "Works with almost any Pakistani e-commerce product link out of the box."
    }
  ];

  return (
    <section id="features" className="py-24 bg-[var(--card-bg)] border-t border-[var(--border-light)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--text-main)]">Everything you need to buy with confidence</h2>
          <p className="text-[var(--text-muted)] max-w-2xl mx-auto">We do the heavy lifting of comparing and reading so you don't have to.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="glass-card bg-white p-8 hover:shadow-lg transition-all group border border-[var(--border-light)]">
              <div className="w-12 h-12 rounded-xl bg-[var(--bg-color)] flex items-center justify-center mb-6 border border-[var(--border-light)] group-hover:scale-110 transition-transform shadow-sm">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[var(--text-main)]">{feature.title}</h3>
              <p className="text-[var(--text-muted)] leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
