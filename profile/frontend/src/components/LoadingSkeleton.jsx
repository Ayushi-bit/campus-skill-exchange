import React from 'react';

export function SkeletonBox({ width = '100%', height = 16, radius = 6, style = {} }) {
  return (
    <div className="skeleton" style={{ width, height, borderRadius: radius, ...style }} />
  );
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <SkeletonBox width={44} height={44} radius={22} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SkeletonBox width="60%" height={14} />
          <SkeletonBox width="40%" height={12} />
        </div>
      </div>
      <SkeletonBox height={12} />
      <SkeletonBox height={12} width="80%" />
      <div style={{ display: 'flex', gap: 8 }}>
        <SkeletonBox width={60} height={24} radius={12} />
        <SkeletonBox width={70} height={24} radius={12} />
        <SkeletonBox width={55} height={24} radius={12} />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid-4" style={{ marginBottom: 24 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SkeletonBox width={36} height={36} radius={8} />
          <SkeletonBox height={28} width="60%" />
          <SkeletonBox height={12} width="80%" />
        </div>
      ))}
    </div>
  );
}
