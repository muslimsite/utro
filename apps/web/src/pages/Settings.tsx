import { useState, type FormEvent } from "react";
import { api } from "../api.ts";
import type { Me } from "../types.ts";

interface Props {
  me: Me;
  onChange: () => void;
}

export default function Settings({ me, onChange }: Props) {
  const [goalTime, setGoalTime] = useState(me.goalTime ?? "06:00");
  const [timezone, setTimezone] = useState(me.timezone);
  const [graceMinutes, setGraceMinutes] = useState(me.graceMinutes);
  const [notifyGroup, setNotifyGroup] = useState(me.notifyGroup);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await api.updateMe({ goalTime, timezone, graceMinutes, notifyGroup });
      setSaved(true);
      onChange();
    } finally {
      setSaving(false);
    }
  }

  function redetectTimezone() {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }

  return (
    <div className="page">
      <h1>Настройки</h1>

      <form className="card" onSubmit={handleSave}>
        <div className="field">
          <label htmlFor="goalTime">Цель подъёма</label>
          <input
            id="goalTime"
            type="time"
            className="input"
            value={goalTime}
            onChange={(e) => setGoalTime(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="graceMinutes">Окно на отметку (минут после цели)</label>
          <input
            id="graceMinutes"
            type="number"
            className="input"
            min={5}
            max={180}
            value={graceMinutes}
            onChange={(e) => setGraceMinutes(Number(e.target.value))}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="timezone">Часовой пояс</label>
          <input id="timezone" className="input" value={timezone} readOnly />
          <button type="button" className="btn btn-secondary" onClick={redetectTimezone}>
            Определить автоматически
          </button>
        </div>

        <div className="switch-row">
          <label htmlFor="notifyGroup">Уведомлять группу о моих отметках</label>
          <input
            id="notifyGroup"
            type="checkbox"
            checked={notifyGroup}
            onChange={(e) => setNotifyGroup(e.target.checked)}
          />
        </div>

        {saved && <p className="hint">Сохранено ✅</p>}

        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Сохраняем…" : "Сохранить"}
        </button>
      </form>
    </div>
  );
}
