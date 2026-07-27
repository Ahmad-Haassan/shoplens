import React from 'react';

export function SkeletonLoader() {
  return (
    <div className="w-full max-w-3xl glass-card bg-transparent border-none p-0 mb-20 animate-pulse">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="skeleton h-8 w-40 rounded-full"></div>
      </div>
      <div className="flex items-start justify-between border-b border-[var(--border-light)] pb-4 mb-4 gap-4">
        <div className="flex-1 min-w-0 flex gap-4">
          <div className="skeleton w-24 h-24 rounded-xl shrink-0"></div>
          <div className="flex-1">
            <div className="skeleton h-8 w-3/4 mb-2 rounded"></div>
            <div className="skeleton h-4 w-1/2 mb-4 rounded"></div>
            <div className="skeleton h-8 w-1/3 rounded-lg"></div>
          </div>
        </div>
      </div>
      <div className="skeleton h-24 w-full rounded-xl mt-4"></div>
    </div>
  );
}
