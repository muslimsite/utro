import { useState, type FormEvent } from "react";
import { api } from "../api.ts";

interface Props {
  onDone: () => void;
}

export default function Onboarding({ onDone }: Props) {
  const [time, setTime] = useState("06:00");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.updateMe({ goalTime: time, timezone });
      onDone();
    } catch {
      setError("Не удалось сохранить. Попробуй ещё раз.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <div className="title-row">
        <span className="brand-mark">🌙</span>
        <h1>Утро</h1>
      </div>
      <p className="hint">
        Социальный челлендж раннего подъёма. Поставь личную цель — время, в которое хочешь вставать, — и отмечайся
        каждый день, чтобы не потерять стрик.
      </p>
      <form className="card" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="goalTime">Во сколько хочешь вставать?</label>
          <input
            id="goalTime"
            type="time"
            className="input"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
        <p className="hint">Часовой пояс определён автоматически: {timezone}</p>
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Сохраняем…" : "Начать"}
        </button>
      </form>
    </div>
  );
}
