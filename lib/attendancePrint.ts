type PrintableSessionTiming = {
  gracePeriodMinutes?: number;
  absentAfterMinutes?: number;
  startTimeOutBeforeEndMinutes?: number;
  timeOutLimitMinutes?: number;
};

const minutesLabel = (value: number) => `${value} minute${value === 1 ? '' : 's'}`;

export const buildAttendancePrintInstructions = (session: PrintableSessionTiming) => {
  const lateAfter = session.gracePeriodMinutes ?? 15;
  const absentAfter = session.absentAfterMinutes ?? 30;
  const timeOutStart = session.startTimeOutBeforeEndMinutes ?? 0;
  const timeOutLimit = session.timeOutLimitMinutes ?? 30;

  return `
        <h2>Attendance Status Guide</h2>
        <ol>
          <li><strong>Log in before scanning.</strong><br>Use your own member account before opening the QR code link.</li>
          <li><strong>Scan once to time in.</strong><br>The first successful scan records your time-in.</li>
          <li><strong>Time-in status rules.</strong><br>
            On time: Timed-in when scanned before the late limit.<br>
            Late: Timed-in Late when scanned after ${minutesLabel(lateAfter)} from the start time.<br>
            Absent: Absent when scanned after ${minutesLabel(absentAfter)} from the start time, or when no time-in is recorded.
          </li>
          <li><strong>Scan again to time out.</strong><br>
            Time-out opens ${minutesLabel(timeOutStart)} before the session end time and closes ${minutesLabel(timeOutLimit)} after the session end time.
          </li>
          <li><strong>Final status after time-out.</strong><br>
            Timed-in + timed-out: Present.<br>
            Timed-in Late + timed-out: Late.<br>
            Timed-in without time-out: Unfinished Attendance.<br>
            Timed-in Late without time-out: Late &amp; Unfinished Attendance.
          </li>
        </ol>
        <span class="warning">Members must scan the printed QR code in person for both time-in and time-out.</span>
  `;
};
