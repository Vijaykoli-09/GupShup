import type { ReactNode } from 'react';

interface Props {
  title: string;
  children?: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title, children, confirmLabel = 'Confirm', danger, busy, onConfirm, onCancel,
}: Props) {
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="card dialog" onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        <div className="muted">{children}</div>
        <div className="dialog-actions">
          <button className="outline" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className={danger ? 'danger' : ''} onClick={onConfirm} disabled={busy}>
            {busy ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
