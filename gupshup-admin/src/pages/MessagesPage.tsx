import { useCallback, useEffect, useState } from 'react';
import { api, del, fmtDate } from '../api';
import ConfirmDialog from '../components/ConfirmDialog';
import type { ChatMessage } from '../types';

export default function MessagesPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [target, setTarget] = useState<ChatMessage | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  const load = useCallback(async (q: string) => {
    setLoading(true);
    try {
      setError('');
      setMessages(await api<ChatMessage[]>(`/api/admin/messages?search=${encodeURIComponent(q)}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search, load]);

  const doDelete = async () => {
    if (!target) return;
    setBusy(true);
    try {
      await del(`/api/admin/messages/${target.id}`);
      setToast('Message deleted');
      setTimeout(() => setToast(''), 2500);
      setTarget(null);
      load(search);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h1>Messages (current chat day)</h1>
      <div className="toolbar">
        <input
          placeholder="Search message or username"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {error && <div className="error">{error}</div>}
      <div className="card table-wrap">
        {loading ? (
          <div className="empty">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="empty">No messages found</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Time</th><th>User</th><th>Message</th><th>Reports</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {messages.map(m => (
                <tr key={m.id}>
                  <td>{fmtDate(m.createdAt)}</td>
                  <td>{m.username}</td>
                  <td style={{ maxWidth: 420 }}>{m.text}</td>
                  <td>
                    {m.reportCount > 0
                      ? <span className="badge PENDING">{m.reportCount}</span>
                      : <span className="muted">0</span>}
                  </td>
                  <td>
                    <button className="small danger" onClick={() => setTarget(m)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {target && (
        <ConfirmDialog
          title="Delete this message?"
          confirmLabel="Delete"
          danger
          busy={busy}
          onConfirm={doDelete}
          onCancel={() => setTarget(null)}>
          <div className="quote">{target.text}</div>
        </ConfirmDialog>
      )}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
