const NOTIFICATIONS_KEY = "fitnaija-notifications";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: "chat" | "challenge" | "workout" | "system";
  read: boolean;
  created_at: string;
}

export function getNotifications(): AppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addNotification(n: Omit<AppNotification, "id" | "read" | "created_at">) {
  const notifications = getNotifications();
  notifications.unshift({
    ...n,
    id: "n_" + Date.now(),
    read: false,
    created_at: new Date().toISOString(),
  });
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications.slice(0, 50)));
  // Also try browser notification
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    new Notification(n.title, { body: n.body, icon: "/fitnaija-icon.svg" });
  }
}

export function markAsRead(id: string) {
  const notifications = getNotifications();
  const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
}

export function markAllRead() {
  const notifications = getNotifications();
  const updated = notifications.map(n => ({ ...n, read: true }));
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
}

export function clearNotifications() {
  localStorage.removeItem(NOTIFICATIONS_KEY);
}

export function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return Promise.resolve(false);
  }
  if (Notification.permission === "granted") return Promise.resolve(true);
  if (Notification.permission === "denied") return Promise.resolve(false);
  return Notification.requestPermission().then(permission => permission === "granted");
}

export function unreadCount(): number {
  return getNotifications().filter(n => !n.read).length;
}
