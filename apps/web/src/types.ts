export interface TodayStatus {
  checkedIn: boolean;
  onTime: boolean | null;
  checkedAt: string | null;
}

export interface Me {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  timezone: string;
  goalTime: string | null;
  graceMinutes: number;
  notifyGroup: boolean;
  streak: number;
  today: TodayStatus;
  hasGroup: boolean;
}

export interface Settings {
  timezone: string;
  goalTime: string | null;
  graceMinutes: number;
  notifyGroup: boolean;
}

export interface GroupMember {
  id: string;
  name: string;
  isOwner: boolean;
  today: TodayStatus;
}

export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  streak: number;
  members: GroupMember[];
}

export interface CheckInResult {
  ok: true;
  date: string;
  time: string;
  onTime: boolean;
  streak: number;
}
