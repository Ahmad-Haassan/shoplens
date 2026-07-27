import React from 'react';
import { Search, LineChart, Zap } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: <Search className="w-6 h-6 text-[#6F4E37]" />,
      title: "Find a Product",
      desc: "Browse your favorite local e-commerce store like Daraz or Telemart. Copy the full link of the product you want to buy."
    },
    {
      step: "02",
      icon: <LineChart className="w-6 h-6 text-[#6F4E37]" />,
      title: "Paste & Filter",
      desc: "Paste the URL into the ShopLens search bar above. Optionally, set a Min and Max price if you have a strict budget."
    },
    {
      step: "03",
      icon: <Zap className="w-6 h-6 text-[#6F4E37]" />,
      title: "Compare & Buy",
      desc: "Hit Analyze! ShopLens uses AI to crawl the web, fetching 10 to 20 alternative deals with features, verdicts, and direct links."
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[var(--bg-color)] border-t border-[var(--border-light)] relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--text-main)]">How to use ShopLens AI</h2>
          <p className="text-[var(--text-muted)] max-w-2xl mx-auto">Follow these three simple steps to unlock the best shopping deals in Pakistan.</p>
        </div>

        <div className="relative grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-[#6F4E37]/30 to-transparent z-0"></div>
          
          {steps.map((stepItem, i) => (
            <div key={i} className="relative glass-card bg-white p-8 rounded-3xl border border-[var(--border-light)] hover:-translate-y-2 transition-transform duration-300 hover:shadow-xl group z-10 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#6F4E37]/5 rounded-full blur-2xl group-hover:bg-[#6F4E37]/10 transition-colors"></div>
              
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[var(--bg-color)] flex items-center justify-center border border-[var(--border-light)] shadow-sm group-hover:scale-110 transition-transform">
                  {stepItem.icon}
                </div>
                <span className="text-5xl font-black text-[#6F4E37]/10 group-hover:text-[#6F4E37]/20 transition-colors">{stepItem.step}</span>
              </div>
              
              <h3 className="text-xl font-bold text-[var(--text-main)] mb-3 relative z-10">{stepItem.title}</h3>
              <p className="text-[var(--text-muted)] relative z-10 leading-relaxed text-sm">{stepItem.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
