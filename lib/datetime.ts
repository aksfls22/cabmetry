import { fromZonedTime } from "date-fns-tz";

export const APP_LOCALE = "es-ES";
export const APP_TIMEZONE = "Europe/Madrid";

/**
 * Returns UTC ISO bounds for the current local calendar day
 * in the configured app timezone.
 */
export function getTodayBoundsUTC(): {
  start: string;
  end: string;
} {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(now);

  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);

  const localStart = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00`;

  const localEnd = `${year}-${String(month).padStart(2, "0")}-${String(day + 1).padStart(2, "0")}T00:00:00`;

  const startUTC = fromZonedTime(localStart, APP_TIMEZONE);
  const endUTC = fromZonedTime(localEnd, APP_TIMEZONE);

  return {
    start: startUTC.toISOString(),
    end: endUTC.toISOString(),
  };
}