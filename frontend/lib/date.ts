export type DateInput = string | number | Date | null | undefined;

function toDate(input: DateInput): Date | null {
  if (!input && input !== 0) return null;
  const d = input instanceof Date ? input : new Date(input as any);
  return isNaN(d.getTime()) ? null : d;
}

export function formatDate(input: DateInput, opts?: { withTime?: boolean; locale?: string }): string {
  const d = toDate(input);
  if (!d) return "";
  const { withTime = false, locale } = opts || {};
  const l = locale || (typeof navigator !== 'undefined' ? navigator.language : 'en-US');
  const dateFmt: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
  const timeFmt: Intl.DateTimeFormatOptions = withTime ? { hour: 'numeric', minute: '2-digit' } : {};
  return new Intl.DateTimeFormat(l, { ...dateFmt, ...timeFmt }).format(d);
}

export function formatDateRange(start: DateInput, end: DateInput, opts?: { withTime?: boolean; locale?: string }): string {
  const s = toDate(start);
  const e = toDate(end);
  if (!s && !e) return "";
  if (s && !e) return formatDate(s, opts);
  if (!s && e) return formatDate(e, opts);
  const sl = formatDate(s!, opts);
  const el = formatDate(e!, opts);
  return `${sl} – ${el}`;
}
