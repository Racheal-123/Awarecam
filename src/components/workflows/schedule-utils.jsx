import { addDays, addWeeks, addMonths, set, format, parseISO, getDay } from 'date-fns';

/**
 * Generates an array of future occurrence dates for a given assignment schedule.
 * @param {object} assignment - The workflow assignment object.
 * @param {number} count - The number of occurrences to generate.
 * @returns {Date[]} An array of Date objects for the next occurrences.
 */
export function generateOccurrences(assignment, count = 5) {
  const { schedule_type, schedule_config, start_date } = assignment;
  if (!schedule_type || !schedule_config || !start_date) {
    return [];
  }

  const occurrences = [];
  let currentDate = parseISO(start_date);
  const now = new Date();

  // Set the time from schedule_config
  if (schedule_config.time) {
    const [hours, minutes] = schedule_config.time.split(':').map(Number);
    currentDate = set(currentDate, { hours, minutes, seconds: 0, milliseconds: 0 });
  }

  // Ensure the first occurrence is not in the past
  while (currentDate < now && schedule_type !== 'one_off') {
    currentDate = getNextDate(currentDate, schedule_type, schedule_config);
  }

  for (let i = 0; i < count; i++) {
    if (i > 0 || (i === 0 && (schedule_type === 'one_off' || currentDate >= now))) {
         occurrences.push(currentDate);
    }
    
    if (schedule_type === 'one_off') break;
    
    currentDate = getNextDate(currentDate, schedule_type, schedule_config);
  }
  
  // If we skipped past occurrences, we might need to add the very next one
  if(occurrences.length === 0 && schedule_type !== 'one_off' && currentDate >= now){
      occurrences.push(currentDate);
  }

  return occurrences.slice(0, count);
}

function getNextDate(date, schedule_type, schedule_config) {
    let nextDate = new Date(date);

    switch (schedule_type) {
        case 'daily':
            return addDays(nextDate, 1);
        case 'weekly':
            // Move to the next day and find the next valid weekday
            nextDate = addDays(nextDate, 1);
            while (!schedule_config.days.includes(getDay(nextDate))) {
                nextDate = addDays(nextDate, 1);
            }
            return nextDate;
        case 'monthly':
            const newDate = addMonths(nextDate, 1);
            // Handle cases like setting 31 on a month with 30 days
            return set(newDate, { date: Math.min(newDate.getDate(), schedule_config.day_of_month) });
        default:
            return addDays(nextDate, 1); // Should not happen for one_off
    }
}