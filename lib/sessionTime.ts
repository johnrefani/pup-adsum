const MANILA_UTC_OFFSET_MINUTES = 8 * 60;

export type SessionDateValue = string | Date;

export function getSessionDateKey(date: SessionDateValue) {
  return (date instanceof Date ? date.toISOString() : date).split('T')[0];
}

export function getManilaDateKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function getSessionDateTime(date: SessionDateValue, time: string) {
  const [year, month, day] = getSessionDateKey(date).split('-').map(Number);
  const [hour = 0, minute = 0] = time.split(':').map(Number);

  if (![year, month, day, hour, minute].every(Number.isFinite)) {
    return new Date(Number.NaN);
  }

  return new Date(
    Date.UTC(year, month - 1, day, hour, minute) -
      MANILA_UTC_OFFSET_MINUTES * 60 * 1000
  );
}

export function getSessionWindow(session: {
  date: SessionDateValue;
  startTime: string;
  endTime: string;
  gracePeriodMinutes?: number;
  absentAfterMinutes?: number;
  startTimeOutBeforeEndMinutes?: number;
  timeOutLimitMinutes?: number;
}) {
  const start = getSessionDateTime(session.date, session.startTime);
  const end = getSessionDateTime(session.date, session.endTime);
  const lateCutoff = new Date(start);
  lateCutoff.setMinutes(lateCutoff.getMinutes() + (session.gracePeriodMinutes ?? 15));
  const absentCutoff = new Date(start);
  absentCutoff.setMinutes(absentCutoff.getMinutes() + (session.absentAfterMinutes ?? 30));
  const timeOutStart = new Date(end);
  timeOutStart.setMinutes(timeOutStart.getMinutes() - (session.startTimeOutBeforeEndMinutes ?? 0));
  const timeOutDeadline = new Date(end);
  timeOutDeadline.setMinutes(timeOutDeadline.getMinutes() + (session.timeOutLimitMinutes ?? 30));

  return {
    start,
    end,
    lateCutoff,
    absentCutoff,
    timeOutStart,
    timeOutDeadline,
  };
}
