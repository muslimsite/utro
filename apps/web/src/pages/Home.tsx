import { useState } from "react";
import { api, ApiError } from "../api.ts";
import { haptic } from "../telegram.ts";
import type { Me } from "../types.ts";

interface Props {
  me: Me;
  onCheckedIn: () => void;
}

function addMinutesLocal(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = (((h * 60 + m + minutes) % 1440) + 1440) % 1440;
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

function describeError(code: string): string {
  switch (code) {
    case "already_checked_in":
      return "Уже отмечено на сегодня.";
    case "goal_not_set":
      return "Сначала укажи цель подъёма в настройках.";
    default:
      return "Что-то пошло не так.";
  }
}

export default function Home({ me, onCheckedIn }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckIn() {
    setError(null);
    setPending(true);
    try {
      const result = await api.checkIn();
      haptic(result.onTime ? "medium" : "soft");
      onCheckedIn();
    } catch (err) {
      setError(err instanceof ApiError ? describeError(err.code) : "Что-то пошло не так");
    } finally {
      setPending(false);
    }
  }

  const deadline = me.goalTime ? addMinutesLocal(me.goalTime, me.graceMinutes) : null;

  return (
    <div className="page">
      <h1>Привет, {me.firstName ?? "друг"} 👋</h1>

      <div className="card streak-hero">
        <div className="streak-number">{me.streak}</div>
        <div className="streak-label">{me.streak === 1 ? "день подряд" : "дней подряд"}</div>
      </div>

      <div className="card">
        {me.today.checkedIn ? (
          <p>
            {me.today.onTime ? "✅ Сегодня ты уже отметился." : "⏱ Сегодня ты отметился, но позже цели."}
          </p>
        ) : (
          <>
            <p className="hint">
              Цель: {me.goalTime}. Окно для отметки — до {deadline}.
            </p>
            {error && <p className="error-text">{error}</p>}
            <button className="btn btn-primary" onClick={handleCheckIn} disabled={pending}>
              {pending ? "Отмечаем…" : "✅ Я встал"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
