'use client'

import React, { useState } from 'react'

interface PriceHistoryChartProps {
  highPrice: number
  lowPrice: number
  currency?: string
  currentPrice?: number
  months?: string[]
}

export function PriceHistoryChart({
  highPrice = 398,
  lowPrice = 318,
  currency = '$',
  currentPrice = 318,
  months = ["Aug '24", "Sep '24", "Oct '24"]
}: PriceHistoryChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; price: number; date: string } | null>(null)

  // 12 data points mimicking the realistic price fluctuations in the sample photo
  const points = [
    { x: 10, y: 35, price: 395, date: "Aug 02" },
    { x: 35, y: 55, price: 375, date: "Aug 12" },
    { x: 60, y: 30, price: 398, date: "Aug 20" },
    { x: 90, y: 45, price: 382, date: "Aug 30" },
    { x: 120, y: 70, price: 360, date: "Sep 08" },
    { x: 145, y: 88, price: 342, date: "Sep 15" },
    { x: 170, y: 65, price: 368, date: "Sep 22" },
    { x: 195, y: 92, price: 338, date: "Sep 29" },
    { x: 220, y: 52, price: 379, date: "Oct 06" },
    { x: 245, y: 80, price: 349, date: "Oct 12" },
    { x: 275, y: 105, price: 318, date: "Oct 18" },
  ]

  // Construct smooth SVG path
  const pathD = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x} ${point.y}`
    const prev = arr[i - 1]
    const cx = (prev.x + point.x) / 2
    return `${acc} C ${cx} ${prev.y}, ${cx} ${point.y}, ${point.x} ${point.y}`
  }, '')

  const areaD = `${pathD} L 275 130 L 10 130 Z`

  return (
    <div className="w-full flex flex-col justify-between select-none">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-[var(--text-muted)] tracking-wide">
          Price History (Last 90 Days)
        </span>
      </div>

      <div className="relative w-full h-[120px] flex items-center">
        {/* Y-axis Labels on Left */}
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[11px] font-medium text-[var(--text-muted)] pointer-events-none">
          <span>{currency}{highPrice}</span>
          <span>{currency}{lowPrice}</span>
        </div>

        {/* SVG Sparkline Area */}
        <div className="w-full h-full pl-10 pr-4">
          <svg
            viewBox="0 0 290 135"
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                <stop offset="60%" stopColor="var(--primary)" stopOpacity="0.06" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </linearGradient>

              <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Subtle horizontal reference lines */}
            <line x1="10" y1="35" x2="280" y2="35" stroke="currentColor" strokeOpacity="0.06" strokeDasharray="3 3" />
            <line x1="10" y1="105" x2="280" y2="105" stroke="currentColor" strokeOpacity="0.06" strokeDasharray="3 3" />

            {/* Area Fill */}
            <path
              d={areaD}
              fill="url(#chartGradient)"
              className="transition-all duration-500"
            />

            {/* Glowing Stroke Line */}
            <path
              d={pathD}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-500"
            />

            {/* Lowest point highlight & price tag pill */}
            <g className="cursor-pointer">
              {/* Outer pulse circle */}
              <circle
                cx="275"
                cy="105"
                r="6"
                fill="var(--primary)"
                fillOpacity="0.35"
                className="animate-ping"
              />
              {/* Core solid circle */}
              <circle
                cx="275"
                cy="105"
                r="4.5"
                fill="var(--primary)"
                stroke="var(--card-bg)"
                strokeWidth="2"
              />

              {/* Tag Pill pinned above/beside point */}
              <g transform="translate(248, 76)">
                <rect
                  x="0"
                  y="0"
                  width="48"
                  height="22"
                  rx="6"
                  fill="var(--primary)"
                  fillOpacity="0.2"
                  stroke="var(--primary)"
                  strokeWidth="1.2"
                />
                <text
                  x="24"
                  y="15"
                  textAnchor="middle"
                  fill="var(--primary)"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="inherit"
                >
                  {currency}{currentPrice}
                </text>
              </g>
            </g>

            {/* Interactive hover points */}
            {points.map((pt, idx) => (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r="8"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint({ index: idx, price: pt.price, date: pt.date })}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}
          </svg>
        </div>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div className="absolute top-0 right-10 bg-[var(--card-bg)] border border-[var(--border-light)] px-2.5 py-1 rounded-lg text-xs shadow-md pointer-events-none animate-in fade-in zoom-in-95 duration-150">
            <span className="font-semibold text-[#22D3EE]">{currency}{hoveredPoint.price}</span>
            <span className="text-[var(--text-muted)] ml-1.5 text-[10px]">{hoveredPoint.date}</span>
          </div>
        )}
      </div>

      {/* X-axis Month Markers */}
      <div className="flex justify-between pl-10 pr-6 text-[10px] font-medium text-[var(--text-muted)] mt-1">
        {months.map((m, idx) => (
          <span key={idx}>{m}</span>
        ))}
      </div>
    </div>
  )
}
