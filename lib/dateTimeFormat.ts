export const MANILA_TIME_ZONE = 'Asia/Manila';

export const formatDisplayDate = (value: string | Date) => {
  const raw = value instanceof Date ? value : value.split('T')[0];
  const date = raw instanceof Date ? raw : new Date(`${raw}T00:00:00`);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: MANILA_TIME_ZONE,
  });
};

export const formatDisplayTime = (value: string | Date) => {
  if (value instanceof Date) {
    return value.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: MANILA_TIME_ZONE,
    });
  }

  const normalized = value.trim();
  if (!normalized) return '';
  if (/\b(am|pm)\b/i.test(normalized)) return normalized;

  const [hourPart, minutePart = '00'] = normalized.split(':');
  const hour = Number(hourPart);
  const minute = Number(minutePart.slice(0, 2));

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return normalized;

  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute.toString().padStart(2, '0')} ${suffix}`;
};

export const formatDisplayDateTime = (date: string | Date, time?: string) => {
  const displayDate = formatDisplayDate(date);
  return time ? `${displayDate}, ${formatDisplayTime(time)}` : displayDate;
};
