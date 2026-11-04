import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import type { DashboardStats } from '../types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      setStats(await api<DashboardStats>('/api/admin/dashboard'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const cards: [string, number | undefined][] = [
    ['Registered users', stats?.totalUsers],
    ['Active users', stats?.activeUsers],
    ['Messages today', stats?.messagesToday],
    ['Pending reports', stats?.pendingReports],
    ['Banned users', stats?.bannedUsers],
  ];

  return (
    <>
      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        <button className="outline" onClick={load}>Refresh</button>
      </div>
      {error && <div className="error">{error}</div>}
      <div className="grid">
        {cards.map(([label, value]) => (
          <div className="card" key={label}>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value ?? '-'}</div>
          </div>
        ))}
      </div>
    </>
  );
}
