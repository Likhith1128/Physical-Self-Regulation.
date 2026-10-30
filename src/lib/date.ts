export const dateKey = (d: Date = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const lastNDays = (n: number, from: Date = new Date()) => {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(from);
    d.setDate(d.getDate() - i);
    days.push(dateKey(d));
  }
  return days;
};

const parseKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const shortLabel = (key: string) =>
  parseKey(key).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export const weekdayLabel = (key: string) =>
  parseKey(key).toLocaleDateString(undefined, { weekday: 'narrow' });

export const formatClock = (totalSeconds: number) => {
  const s = Math.max(0, Math.round(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export const formatHour = (hour: number) => {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
};
