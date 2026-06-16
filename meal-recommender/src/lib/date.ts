const SEOUL_TIME_ZONE = "Asia/Seoul";

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: SEOUL_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function toSeoulDateKey(value: Date | string = new Date()): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return dateFormatter.format(date);
}

export function isSameSeoulDate(value: string, target = new Date()): boolean {
  return toSeoulDateKey(value) === toSeoulDateKey(target);
}

export function getSeoulDay(value: Date | string = new Date()): number {
  const dateKey = toSeoulDateKey(value);
  return new Date(`${dateKey}T12:00:00+09:00`).getDay();
}

export function getSeoulDateParts(value: Date | string = new Date()): { year: number; month: number; date: number } {
  const dateKey = toSeoulDateKey(value);
  const [year, month, date] = dateKey.split("-").map(Number);
  return { year, month, date };
}

export function getSeoulDateRange(value: Date | string = new Date()): { start: string; end: string } {
  const dateKey = toSeoulDateKey(value);
  const startDate = new Date(`${dateKey}T00:00:00+09:00`);
  const endDate = new Date(startDate);
  endDate.setUTCDate(endDate.getUTCDate() + 1);
  return { start: startDate.toISOString(), end: endDate.toISOString() };
}
