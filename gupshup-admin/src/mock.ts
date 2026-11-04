import type {
  AdminUser, BanDuration, ChatMessage, DashboardStats, Report,
} from './types';

const ago = (min: number) => new Date(Date.now() - min * 60000).toISOString();

let users: AdminUser[] = [
  { id: 1, username: 'SilentTiger482', registeredAt: ago(60 * 24 * 40), status: 'ACTIVE', banUntil: null },
  { id: 2, username: 'BlueMoon173', registeredAt: ago(60 * 24 * 35), status: 'ACTIVE', banUntil: null },
  { id: 3, username: 'CrazyFalcon821', registeredAt: ago(60 * 24 * 30), status: 'ACTIVE', banUntil: null },
  { id: 4, username: 'HiddenWolf394', registeredAt: ago(60 * 24 * 22), status: 'BANNED', banUntil: ago(-60 * 24 * 3) },
  { id: 5, username: 'SmartPanda621', registeredAt: ago(60 * 24 * 18), status: 'ACTIVE', banUntil: null },
  { id: 6, username: 'MidnightRider287', registeredAt: ago(60 * 24 * 10), status: 'ACTIVE', banUntil: null },
  { id: 7, username: 'BraveEagle512', registeredAt: ago(60 * 24 * 6), status: 'BANNED', banUntil: null },
  { id: 8, username: 'LuckyComet908', registeredAt: ago(60 * 24 * 2), status: 'ACTIVE', banUntil: null },
];

let messages: ChatMessage[] = [
  { id: 101, username: 'BlueMoon173', text: 'Good morning Jaysingpur! Any good mobile repair shop near the market?', createdAt: ago(190), reportCount: 0 },
  { id: 102, username: 'CrazyFalcon821', text: 'Try the shop near the bus stand, fixed my screen in one day.', createdAt: ago(185), reportCount: 0 },
  { id: 103, username: 'HiddenWolf394', text: 'You are all idiots, nobody asked you anything', createdAt: ago(120), reportCount: 2 },
  { id: 104, username: 'SmartPanda621', text: 'Road work near the market is still going on, use the back lane.', createdAt: ago(100), reportCount: 0 },
  { id: 105, username: 'BraveEagle512', text: 'Buy cheap followers now!!! click my link', createdAt: ago(75), reportCount: 1 },
  { id: 106, username: 'MidnightRider287', text: 'Misal pav stall near the station is really good.', createdAt: ago(40), reportCount: 0 },
  { id: 107, username: 'LuckyComet908', text: 'Is there a bus to Kolhapur after 9 PM?', createdAt: ago(20), reportCount: 0 },
];

let reports: Report[] = [
  { id: 1, reportedUserId: 4, reportedUsername: 'HiddenWolf394', reporterUsername: 'BlueMoon173', reason: 'ABUSIVE_LANGUAGE', description: 'Insulting everyone in the chat', messageId: 103, messageText: 'You are all idiots, nobody asked you anything', createdAt: ago(110), status: 'PENDING' },
  { id: 2, reportedUserId: 7, reportedUsername: 'BraveEagle512', reporterUsername: 'SmartPanda621', reason: 'SPAM', description: 'Advertising links', messageId: 105, messageText: 'Buy cheap followers now!!! click my link', createdAt: ago(70), status: 'PENDING' },
  { id: 3, reportedUserId: 4, reportedUsername: 'HiddenWolf394', reporterUsername: 'LuckyComet908', reason: 'HARASSMENT', description: null, messageId: 103, messageText: 'You are all idiots, nobody asked you anything', createdAt: ago(95), status: 'PENDING' },
  { id: 4, reportedUserId: 3, reportedUsername: 'CrazyFalcon821', reporterUsername: 'MidnightRider287', reason: 'FAKE_INFORMATION', description: 'Not sure this is true', messageId: null, messageText: null, createdAt: ago(60 * 26), status: 'DISMISSED' },
  { id: 5, reportedUserId: 7, reportedUsername: 'BraveEagle512', reporterUsername: 'BlueMoon173', reason: 'SPAM', description: null, messageId: null, messageText: null, createdAt: ago(60 * 30), status: 'REVIEWED' },
];

const banMs: Record<BanDuration, number | null> = {
  HOUR_1: 3600e3,
  HOURS_24: 24 * 3600e3,
  DAYS_7: 7 * 24 * 3600e3,
  DAYS_30: 30 * 24 * 3600e3,
  PERMANENT: null,
};

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function mockApi(path: string, options: RequestInit): Promise<unknown> {
  await wait(250);
  const method = (options.method || 'GET').toUpperCase();
  const url = new URL(path, 'http://mock');
  const p = url.pathname;
  const body = options.body ? JSON.parse(options.body as string) : {};
  const q = (url.searchParams.get('search') || '').toLowerCase();

  if (p === '/api/admin/auth/login' && method === 'POST') {
    if (body.email === 'admin@gupshup.com' && body.password === 'admin123') {
      return { accessToken: 'mock-admin-token' };
    }
    throw new Error('Invalid credentials');
  }

  if (p === '/api/admin/dashboard') {
    const stats: DashboardStats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'ACTIVE').length,
      messagesToday: messages.length,
      pendingReports: reports.filter(r => r.status === 'PENDING').length,
      bannedUsers: users.filter(u => u.status === 'BANNED').length,
    };
    return stats;
  }

  if (p === '/api/admin/users' && method === 'GET') {
    return users.filter(u => !q || u.username.toLowerCase().includes(q) || String(u.id) === q);
  }

  let m = p.match(/^\/api\/admin\/users\/(\d+)\/ban$/);
  if (m && method === 'POST') {
    const u = users.find(x => x.id === Number(m![1]));
    if (!u) throw new Error('User not found');
    const ms = banMs[body.duration as BanDuration];
    u.status = 'BANNED';
    u.banUntil = ms ? new Date(Date.now() + ms).toISOString() : null;
    return { message: 'User banned' };
  }

  m = p.match(/^\/api\/admin\/users\/(\d+)\/unban$/);
  if (m && method === 'POST') {
    const u = users.find(x => x.id === Number(m![1]));
    if (!u) throw new Error('User not found');
    u.status = 'ACTIVE';
    u.banUntil = null;
    return { message: 'User unbanned' };
  }

  if (p === '/api/admin/reports' && method === 'GET') {
    const status = url.searchParams.get('status');
    return reports
      .filter(r => !status || r.status === status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  m = p.match(/^\/api\/admin\/reports\/(\d+)\/(review|dismiss)$/);
  if (m && method === 'POST') {
    const r = reports.find(x => x.id === Number(m![1]));
    if (!r) throw new Error('Report not found');
    r.status = m[2] === 'review' ? 'REVIEWED' : 'DISMISSED';
    return { message: 'Report updated' };
  }

  if (p === '/api/admin/messages' && method === 'GET') {
    return messages.filter(
      x => !q || x.text.toLowerCase().includes(q) || x.username.toLowerCase().includes(q),
    );
  }

  m = p.match(/^\/api\/admin\/messages\/(\d+)$/);
  if (m && method === 'DELETE') {
    const id = Number(m[1]);
    messages = messages.filter(x => x.id !== id);
    reports = reports.map(r =>
      r.messageId === id ? { ...r, messageId: null } : r, // text stays as evidence
    );
    return { message: 'Message deleted' };
  }

  throw new Error(`Mock: unknown endpoint ${method} ${p}`);
}
