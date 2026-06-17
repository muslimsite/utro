import { useState, type FormEvent } from "react";
import { api, ApiError } from "../api.ts";
import type { Group as GroupType } from "../types.ts";

interface Props {
  group: GroupType | null;
  onChange: () => void;
}

function describeError(code: string): string {
  switch (code) {
    case "already_in_group":
      return "Ты уже состоишь в группе.";
    case "group_not_found":
      return "Группа с таким кодом не найдена.";
    default:
      return "Что-то пошло не так.";
  }
}

export default function Group({ group, onChange }: Props) {
  if (group) return <GroupView group={group} onChange={onChange} />;
  return <NoGroup onChange={onChange} />;
}

function NoGroup({ onChange }: { onChange: () => void }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"create" | "join" | null>(null);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    setPending("create");
    try {
      await api.createGroup(name.trim());
      onChange();
    } catch (err) {
      setError(err instanceof ApiError ? describeError(err.code) : "Что-то пошло не так");
    } finally {
      setPending(null);
    }
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setError(null);
    setPending("join");
    try {
      await api.joinGroup(code.trim());
      onChange();
    } catch (err) {
      setError(err instanceof ApiError ? describeError(err.code) : "Что-то пошло не так");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="page">
      <h1>Группа</h1>
      <p className="hint">Создай группу с друзьями или семьёй — стрик группы держится, пока встают все.</p>

      {error && <p className="error-text">{error}</p>}

      <form className="card" onSubmit={handleCreate}>
        <h2>Создать группу</h2>
        <div className="field">
          <label htmlFor="groupName">Название</label>
          <input
            id="groupName"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            placeholder="Например, Утренние птицы"
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={pending !== null}>
          {pending === "create" ? "Создаём…" : "Создать"}
        </button>
      </form>

      <form className="card" onSubmit={handleJoin}>
        <h2>Вступить по коду</h2>
        <div className="field">
          <label htmlFor="inviteCode">Код приглашения</label>
          <input
            id="inviteCode"
            className="input"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={20}
            placeholder="Например, G22W4H"
          />
        </div>
        <button className="btn btn-secondary" type="submit" disabled={pending !== null}>
          {pending === "join" ? "Вступаем…" : "Вступить"}
        </button>
      </form>
    </div>
  );
}

function GroupView({ group, onChange }: { group: GroupType; onChange: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleLeave() {
    setLeaving(true);
    try {
      await api.leaveGroup();
      onChange();
    } finally {
      setLeaving(false);
      setConfirming(false);
    }
  }

  return (
    <div className="page">
      <h1>{group.name}</h1>

      <div className="card streak-hero">
        <div className="streak-number">{group.streak}</div>
        <div className="streak-label">{group.streak === 1 ? "день подряд вместе" : "дней подряд вместе"}</div>
      </div>

      <div className="card">
        <h2>Код приглашения</h2>
        <div className="invite-code">{group.inviteCode}</div>
        <p className="hint">Отправь этот код друзьям, чтобы они присоединились.</p>
      </div>

      <div className="card">
        <h2>Участники</h2>
        {group.members.map((member) => (
          <div className="member-row" key={member.id}>
            <span className="member-name">
              {member.name}
              {member.isOwner && <span className="owner-tag">владелец</span>}
            </span>
            <span className="status-mark">{member.today.checkedIn ? (member.today.onTime ? "✅" : "⏱") : "▫️"}</span>
          </div>
        ))}
      </div>

      {confirming ? (
        <div className="card">
          <p>Точно выйти из группы?</p>
          <button className="btn btn-danger" onClick={handleLeave} disabled={leaving}>
            {leaving ? "Выходим…" : "Да, выйти"}
          </button>
          <button className="btn btn-secondary" onClick={() => setConfirming(false)} disabled={leaving}>
            Отмена
          </button>
        </div>
      ) : (
        <button className="btn btn-secondary" onClick={() => setConfirming(true)}>
          Выйти из группы
        </button>
      )}
    </div>
  );
}
