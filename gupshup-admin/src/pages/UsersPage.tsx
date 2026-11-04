import { useCallback, useEffect, useState } from 'react';
import { api, fmtDate, post } from '../api';
import BanDialog from '../components/BanDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import type { AdminUser, BanDuration } from '../types';

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
  const [unbanTarget, setUnbanTarget] = useState<AdminUser | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  const load = useCallback(async (q: string) => {
    setLoading(true);
    try {
      setError('');
      setUsers(await api<AdminUser[]>(`/api/admin/users?search=${encodeURIComponent(q)}`));
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

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(''), 2500);
  };

  const doBan = async (duration: BanDuration) => {
    if (!banTarget) return;
    setBusy(true);
    try {
      await post(`/api/admin/users/${banTarget.id}/ban`, { duration });
      showToast(`${banTarget.username} banned`);
      setBanTarget(null);
      load(search);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const doUnban = async () => {
    if (!unbanTarget) return;
    setBusy(true);
    try {
      await post(`/api/admin/users/${unbanTarget.id}/unban`);
      showToast(`${unbanTarget.username} unbanned`);
      setUnbanTarget(null);
      load(search);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const banText = (u: AdminUser) =>
    u.status !== 'BANNED' ? '-' : u.banUntil ? `Until ${fmtDate(u.banUntil)}` : 'Permanent';

  return (
    <>
      <h1>Users</h1>
      <div className="toolbar">
        <input
          placeholder="Search by name, username, city, phone or ID"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {error && <div className="error">{error}</div>}
      <div className="card table-wrap">
        {loading ? (
          <div className="empty">Loading...</div>
        ) : users.length === 0 ? (
          <div className="empty">No users found</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Full name</th><th>Username</th><th>City</th>
                <th>Phone</th><th>Registered</th><th>Status</th><th>Ban</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.fullName}</td>
                  <td>{u.username}</td>
                  <td>{u.city}</td>
                  <td>+91 {u.phone}</td>
                  <td>{fmtDate(u.registeredAt)}</td>
                  <td><span className={`badge ${u.status}`}>{u.status}</span></td>
                  <td>{banText(u)}</td>
                  <td>
                    <div className="actions">
                      {u.status === 'ACTIVE' ? (
                        <button className="small danger" onClick={() => setBanTarget(u)}>Ban</button>
                      ) : (
                        <button className="small" onClick={() => setUnbanTarget(u)}>Unban</button>
                      )}
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
          username={banTarget.username}
          busy={busy}
          onConfirm={doBan}
          onCancel={() => setBanTarget(null)}
        />
      )}
      {unbanTarget && (
        <ConfirmDialog
          title={`Unban ${unbanTarget.username}?`}
          confirmLabel="Unban"
          busy={busy}
          onConfirm={doUnban}
          onCancel={() => setUnbanTarget(null)}>
          The user will be able to send messages again.
        </ConfirmDialog>
      )}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}