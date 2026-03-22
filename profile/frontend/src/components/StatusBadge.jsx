import React from 'react';

const STATUS_MAP = {
  open:         { label: 'Open',        cls: 'badge-open' },
  in_progress:  { label: 'In Progress', cls: 'badge-in_progress' },
  'in progress':{ label: 'In Progress', cls: 'badge-in_progress' },
  completed:    { label: 'Completed',   cls: 'badge-completed' },
  closed:       { label: 'Closed',      cls: 'badge-closed' },
  pending:      { label: 'Pending',     cls: 'badge-pending' },
  accepted:     { label: 'Accepted',    cls: 'badge-accepted' },
  rejected:     { label: 'Rejected',    cls: 'badge-rejected' },
  beginner:     { label: 'Beginner',    cls: 'badge-beginner' },
  intermediate: { label: 'Intermediate',cls: 'badge-intermediate' },
  advanced:     { label: 'Advanced',    cls: 'badge-advanced' },
};

export default function StatusBadge({ status = '', style = {} }) {
  // ← null/undefined guard added here
  if (!status) return null;

  const key   = status.toLowerCase().replace(/_/g, ' ').trim();
  const found = STATUS_MAP[key] || STATUS_MAP[status.toLowerCase()] || { label: status, cls: 'badge-closed' };

  return (
    <span className={`badge ${found.cls}`} style={style}>
      {found.label}
    </span>
  );
}