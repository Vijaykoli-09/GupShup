import { useState } from 'react';
import { BAN_OPTIONS, type BanDuration } from '../types';
import ConfirmDialog from './ConfirmDialog';

interface Props {
  username: string;
  busy?: boolean;
  onConfirm: (duration: BanDuration) => void;
  onCancel: () => void;
}

export default function BanDialog({ username, busy, onConfirm, onCancel }: Props) {
  const [duration, setDuration] = useState<BanDuration>('HOURS_24');

  return (
    <ConfirmDialog
      title={`Ban ${username}?`}
      confirmLabel="Ban user"
      danger
      busy={busy}
      onConfirm={() => onConfirm(duration)}
      onCancel={onCancel}>
      <p>The user will not be able to send messages until the ban ends.</p>
      <select value={duration} onChange={e => setDuration(e.target.value as BanDuration)}>
        {BAN_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </ConfirmDialog>
  );
}
