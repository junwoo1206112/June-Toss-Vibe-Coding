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

