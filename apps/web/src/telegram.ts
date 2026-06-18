interface TelegramWebApp {
  initData: string;
  colorScheme: "light" | "dark";
  ready(): void;
  expand(): void;
  openLink?(url: string, options?: { try_instant_view?: boolean }): void;
  HapticFeedback?: {
    impactOccurred(style: "light" | "medium" | "heavy" | "rigid" | "soft"): void;
    notificationOccurred(type: "error" | "success" | "warning"): void;
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}

const DEV_TELEGRAM_ID = "1";

export const webApp = window.Telegram?.WebApp;

// The app uses a fixed brand palette (see styles.css) rather than Telegram's live
// theme colors, so onboarding/marketing visuals stay consistent across light/dark clients.
export function initTelegram(): void {
  webApp?.ready();
  webApp?.expand();
}

export function haptic(style: "light" | "medium" | "heavy" | "rigid" | "soft" = "medium"): void {
  webApp?.HapticFeedback?.impactOccurred(style);
}

export function openExternalLink(url: string): void {
  if (webApp?.openLink) {
    webApp.openLink(url);
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

// Outside Telegram (plain browser dev), there's no signed initData. The server only
// accepts the matching `x-dev-telegram-id` bypass when ALLOW_DEV_AUTH=true, so this
// is safe to ship: it's a no-op against any real deployment.
export function getAuthHeaders(): Record<string, string> {
  if (webApp?.initData) {
    return { Authorization: `tma ${webApp.initData}` };
  }
  if (import.meta.env.DEV) {
    return { "x-dev-telegram-id": DEV_TELEGRAM_ID };
  }
  return {};
}
