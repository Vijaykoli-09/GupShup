export type BanDuration = 'HOUR_1' | 'HOURS_24' | 'DAYS_7' | 'DAYS_30' | 'PERMANENT';
export type UserStatus = 'ACTIVE' | 'BANNED';
export type ReportStatus = 'PENDING' | 'REVIEWED' | 'DISMISSED';

export const BAN_OPTIONS: { value: BanDuration; label: string }[] = [
  { value: 'HOUR_1', label: '1 hour' },
  { value: 'HOURS_24', label: '24 hours' },
  { value: 'DAYS_7', label: '7 days' },
  { value: 'DAYS_30', label: '30 days' },
  { value: 'PERMANENT', label: 'Permanent' },
];

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  messagesToday: number;
  pendingReports: number;
  bannedUsers: number;
}

// No real names or phone numbers anywhere in the admin panel.
export interface AdminUser {
  id: number;
  username: string;
  fullName: string;
  city: string;
  phone: string;
  registeredAt: string;
  status: UserStatus;
  banUntil: string | null;
}

export interface Report {
  id: number;
  reportedUserId: number;
  reportedUsername: string;
  reporterUsername: string;
  reason: string;
  description: string | null;
  messageId: number | null;
  messageText: string | null;
  createdAt: string;
  status: ReportStatus;
}

export interface ChatMessage {
  id: number;
  username: string;
  text: string;
  createdAt: string;
  reportCount: number;
}
