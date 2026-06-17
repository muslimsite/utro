import { useCallback, useEffect, useState } from "react";
import { api } from "./api.ts";
import type { Me, Group as GroupType } from "./types.ts";
import Onboarding from "./pages/Onboarding.tsx";
import Home from "./pages/Home.tsx";
import Group from "./pages/Group.tsx";
import Settings from "./pages/Settings.tsx";

type Tab = "home" | "group" | "settings";

export default function App() {
  const [me, setMe] = useState<Me | null>(null);
  const [group, setGroup] = useState<GroupType | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("home");

  const refresh = useCallback(async () => {
    const [meData, groupData] = await Promise.all([api.getMe(), api.getGroup()]);
    setMe(meData);
    setGroup(groupData);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  if (loading) {
    return (
      <div className="centered">
        <p className="hint">Загрузка…</p>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="centered">
        <p className="error-text">Не удалось загрузить профиль. Перезапусти приложение.</p>
      </div>
    );
  }

  if (!me.goalTime) {
    return <Onboarding onDone={refresh} />;
  }

  return (
    <div className="app">
      {tab === "home" && <Home me={me} onCheckedIn={refresh} />}
      {tab === "group" && <Group group={group} onChange={refresh} />}
      {tab === "settings" && <Settings me={me} onChange={refresh} />}

      <nav className="tabbar">
        <button className={`tab ${tab === "home" ? "active" : ""}`} onClick={() => setTab("home")}>
          <span className="tab-icon">🏠</span>
          Главное
        </button>
        <button className={`tab ${tab === "group" ? "active" : ""}`} onClick={() => setTab("group")}>
          <span className="tab-icon">👥</span>
          Группа
        </button>
        <button className={`tab ${tab === "settings" ? "active" : ""}`} onClick={() => setTab("settings")}>
          <span className="tab-icon">⚙️</span>
          Настройки
        </button>
      </nav>
    </div>
  );
}
