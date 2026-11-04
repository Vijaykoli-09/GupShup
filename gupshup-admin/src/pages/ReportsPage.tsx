import { useCallback, useEffect, useState } from 'react';
import { api, del, fmtDate, post } from '../api';
import BanDialog from '../components/BanDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import type { BanDuration, Report, ReportStatus } from '../types';

type Filter = ReportStatus | 'ALL';
const FILTERS: Filter[] = ['PENDING', 'REVIEWED', 'DISMISSED', 'ALL'];
const reasonLabel = (r: string) => r.replaceAll('_', ' ').toLowerCase();

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<Filter>('PENDING');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [banTarget, setBanTarget] = useState<Report | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Report | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  const load = useCallback(async (f: Filter) => {
    setLoading(true);
    try {
      setError('');
      const qs = f === 'ALL' ? '' : `?status=${f}`;
      setReports(await api<Report[]>(`/api/admin/reports${qs}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(filter); }, [filter, load]);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(''), 2500);
  };

  const run = async (fn: () => Promise<unknown>, okMsg: string, done?: () => void) => {
    setBusy(true);
    try {
      await fn();
      showToast(okMsg);
      done?.();
      load(filter);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  // Admin must review the evidence. Nothing is banned automatically.
  const setStatus = (r: Report, action: 'review' | 'dismiss') =>
    run(
      () => post(`/api/admin/reports/${r.id}/${action}`),
      action === 'review' ? 'Marked as reviewed' : 'Report dismissed',
    );

  const doBan = (duration: BanDuration) =>
    banTarget &&
    run(
      async () => {
        await post(`/api/admin/users/${banTarget.reportedUserId}/ban`, { duration });
        await post(`/api/admin/reports/${banTarget.id}/review`);
      },
      `${banTarget.reportedUsername} banned`,
      () => setBanTarget(null),
    );

  const doDelete = () =>
    deleteTarget &&
    deleteTarget.messageId !== null &&
    run(
      () => del(`/api/admin/messages/${deleteTarget.messageId}`),
      'Message deleted',
      () => setDeleteTarget(null),
    );

  return (
    <>
      <h1>Reports</h1>
      <div className="tabs">
        {FILTERS.map(f => (
          <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
      {error && <div className="error">{error}</div>}
      <div className="card table-wrap">
        {loading ? (
          <div className="empty">Loading...</div>
        ) : reports.length === 0 ? (
          <div className="empty">No reports here</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Reported</th><th>Reporter</th><th>Reason</th>
                <th>Message</th><th>Date</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.reportedUsername}</td>
                  <td>{r.reporterUsername}</td>
                  <td>
                    {reasonLabel(r.reason)}
                    {r.description && <div className="muted">{r.description}</div>}
                  </td>
                  <td>
                    {r.messageText ? (
                      <div className="quote">{r.messageText}</div>
                    ) : (
                      <span className="muted">User report</span>
                    )}
                  </td>
                  <td>{fmtDate(r.createdAt)}</td>
                  <td><span className={`badge ${r.status}`}>{r.status}</span></td>
                  <td>
                    <div className="actions">
                      {r.status === 'PENDING' && (
                        <>
                          <button className="small" disabled={busy} onClick={() => setStatus(r, 'review')}>Reviewed</button>
                          <button className="small outline" disabled={busy} onClick={() => setStatus(r, 'dismiss')}>Dismiss</button>
                        </>
                      )}
                      {r.messageId !== null && (
                        <button className="small outline" onClick={() => setDeleteTarget(r)}>Delete msg</button>
                      )}
                      <button className="small danger" onClick={() => setBanTarget(r)}>Ban user</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {banTarget && (
        <BanDialog
          username={banTarget.reportedUsername}
          busy={busy}
          onConfirm={doBan}
          onCancel={() => setBanTarget(null)}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete this message?"
          confirmLabel="Delete"
          danger
          busy={busy}
          onConfirm={doDelete}
          onCancel={() => setDeleteTarget(null)}>
          It disappears from the chat for everyone. The report keeps a copy as evidence.
        </ConfirmDialog>
      )}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
