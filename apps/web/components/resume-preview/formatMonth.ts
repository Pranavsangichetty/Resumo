/**
 * Converts a YYYY-MM value from an HTML month input
 * into a human-readable format (e.g. "Jul 2026").
 */
export default function formatMonth(value?: string): string {
  if (!value) {
    return "";
  }

  const [year, month] = value.split("-");

  if (!year || !month) {
    return value;
  }

  const date = new Date(
    Number(year),
    Number(month) - 1,
    1
  );

  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}