// Date formatting utilities for Vietnamese locale
export const formatVietnameseMonth = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
    'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
    'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];
  
  return `${monthNames[dateObj.getMonth()]}/${dateObj.getFullYear()}`;
};

export const formatShortVietnameseMonth = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const shortMonthNames = [
    'T1', 'T2', 'T3', 'T4', 'T5', 'T6',
    'T7', 'T8', 'T9', 'T10', 'T11', 'T12'
  ];
  
  return `${shortMonthNames[dateObj.getMonth()]}/${dateObj.getFullYear().toString().slice(-2)}`;
};

export const getCurrentVietnameseMonth = (): string => {
  return formatVietnameseMonth(new Date());
};

export const getRelativeMonth = (monthsAgo: number): string => {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo);
  return formatVietnameseMonth(date);
};

export const formatDateRange = (startDate: Date | string, endDate: Date | string): string => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  const startDay = start.getDate();
  const endDay = end.getDate();
  const month = start.getMonth() + 1;
  const year = start.getFullYear();
  
  return `${startDay}-${endDay}/${month}/${year}`;
};

export const isCurrentMonth = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  return dateObj.getMonth() === now.getMonth() && 
         dateObj.getFullYear() === now.getFullYear();
};

export const getMonthProgress = (): number => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const totalDays = endOfMonth.getDate();
  const currentDay = now.getDate();
  
  return Math.round((currentDay / totalDays) * 100);
};
