interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
}

interface TelegramWebApp {
  initData: string;
  colorScheme: "light" | "dark";
  themeParams: TelegramThemeParams;
  ready(): void;
  expand(): void;
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

export function initTelegram(): void {
  if (!webApp) return;
  webApp.ready();
  webApp.expand();

  const theme = webApp.themeParams;
  const root = document.documentElement.style;
  if (theme.bg_color) root.setProperty("--tg-bg", theme.bg_color);
  if (theme.text_color) root.setProperty("--tg-text", theme.text_color);
  if (theme.hint_color) root.setProperty("--tg-hint", theme.hint_color);
  if (theme.button_color) root.setProperty("--tg-button", theme.button_color);
  if (theme.button_text_color) root.setProperty("--tg-button-text", theme.button_text_color);
  if (theme.secondary_bg_color) root.setProperty("--tg-secondary-bg", theme.secondary_bg_color);
}

export function haptic(style: "light" | "medium" | "heavy" | "rigid" | "soft" = "medium"): void {
  webApp?.HapticFeedback?.impactOccurred(style);
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
