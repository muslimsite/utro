import { getAuthHeaders } from "./telegram.ts";
import type { Me, Settings, Group, CheckInResult } from "./types.ts";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...getAuthHeaders(),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error ?? "unknown_error");
  }

  return res.json() as Promise<T>;
}

export interface MeUpdatePayload {
  timezone?: string;
  goalTime?: string | null;
  graceMinutes?: number;
  notifyGroup?: boolean;
}

export const api = {
  getMe: () => request<Me>("/api/me"),
  updateMe: (patch: MeUpdatePayload) => request<Settings>("/api/me", { method: "PATCH", body: JSON.stringify(patch) }),
  checkIn: () => request<CheckInResult>("/api/checkin", { method: "POST" }),
  getGroup: () => request<Group | null>("/api/group"),
  createGroup: (name: string) => request<Group>("/api/group", { method: "POST", body: JSON.stringify({ name }) }),
  joinGroup: (inviteCode: string) =>
    request<Group>("/api/group/join", { method: "POST", body: JSON.stringify({ inviteCode }) }),
  leaveGroup: () => request<{ ok: true }>("/api/group/leave", { method: "POST" }),
};
