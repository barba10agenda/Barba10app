/**
 * Helper utility to handle barber lunch break calculations and availability checks.
 */

export interface LunchBreakRange {
  startMinutes: number;
  endMinutes: number;
  startStr: string;
  endStr: string;
}

/**
 * Converts "HH:MM" or "HH:MMh" to total minutes from 00:00.
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return -1;
  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (!match) return -1;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  return hours * 60 + minutes;
}

/**
 * Parses lunch break string (e.g. "12:00 - 13:00", "12:00 às 13:00", "12:00 - 13:30")
 * or separate lunchStart and lunchEnd parameters into minutes.
 */
export function parseLunchBreak(
  lunchBreakStr?: string,
  lunchStart?: string,
  lunchEnd?: string
): LunchBreakRange | null {
  // If separate lunchStart and lunchEnd exist
  if (lunchStart && lunchEnd) {
    const startMin = parseTimeToMinutes(lunchStart);
    const endMin = parseTimeToMinutes(lunchEnd);
    if (startMin >= 0 && endMin > startMin) {
      return {
        startMinutes: startMin,
        endMinutes: endMin,
        startStr: lunchStart,
        endStr: lunchEnd
      };
    }
  }

  if (!lunchBreakStr) return null;

  // Find all HH:MM formatted times in lunchBreakStr
  const timeMatches = lunchBreakStr.match(/(\d{1,2}:\d{2})/g);
  if (!timeMatches || timeMatches.length < 2) return null;

  const startStr = timeMatches[0];
  const endStr = timeMatches[1];

  const startMin = parseTimeToMinutes(startStr);
  const endMin = parseTimeToMinutes(endStr);

  if (startMin >= 0 && endMin > startMin) {
    return {
      startMinutes: startMin,
      endMinutes: endMin,
      startStr,
      endStr
    };
  }

  return null;
}

/**
 * Checks if a specific time slot (e.g. "12:00", "12:40", "13:00")
 * falls within a barber's lunch break interval.
 */
export function isBarberInLunchBreak(
  timeSlot: string,
  lunchBreakStr?: string,
  lunchStart?: string,
  lunchEnd?: string
): boolean {
  if (!timeSlot) return false;

  const range = parseLunchBreak(lunchBreakStr, lunchStart, lunchEnd);
  if (!range) return false;

  const slotMinutes = parseTimeToMinutes(timeSlot);
  if (slotMinutes < 0) return false;

  // A slot is during lunch if slotMinutes is >= startMinutes and < endMinutes
  return slotMinutes >= range.startMinutes && slotMinutes < range.endMinutes;
}
