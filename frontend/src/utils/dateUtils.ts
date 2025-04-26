import { format, getISOWeek, getYear, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';

export const getWeekNumber = (date: Date) => {
  return {
    week: getISOWeek(date),
    year: getYear(date),
  };
};

export const getWeekRange = (weekNumber: number, year: number) => {
  // Create a date in the specified week
  const date = new Date(year, 0, 1 + (weekNumber - 1) * 7);
  
  // Get the start and end of the week
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday as start of week
  const end = endOfWeek(date, { weekStartsOn: 1 }); // Sunday as end of week
  
  return {
    start,
    end,
    formattedRange: `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`,
  };
};

export const getNextWeek = (weekNumber: number, year: number) => {
  // Create a date in the current week
  const date = new Date(year, 0, 1 + (weekNumber - 1) * 7);
  
  // Get the next week
  const nextWeekDate = addWeeks(date, 1);
  
  return getWeekNumber(nextWeekDate);
};

export const getPreviousWeek = (weekNumber: number, year: number) => {
  // Create a date in the current week
  const date = new Date(year, 0, 1 + (weekNumber - 1) * 7);
  
  // Get the previous week
  const prevWeekDate = subWeeks(date, 1);
  
  return getWeekNumber(prevWeekDate);
}; 