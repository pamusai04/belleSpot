// utils/timeUtils.js

export const calculateTimingInfo = (timings, currentTime = new Date()) => {
  if (!timings?.length) return null;

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[currentTime.getDay()];
  const todayTiming = timings.find(t => t.day === today);
  
  if (!todayTiming || todayTiming.isClosed) return null;

  const parseTime = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes;
    if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60;
    if (period === 'AM' && hours === 12) totalMinutes -= 12 * 60;
    return totalMinutes;
  };
  
  const currentTotalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const openTime = parseTime(todayTiming.opens);
  const closeTime = parseTime(todayTiming.closes);
  
  if (currentTotalMinutes >= openTime && currentTotalMinutes < closeTime) {
    return {
      isOpen: true,
      remainingMinutes: closeTime - currentTotalMinutes,
      closingTime: todayTiming.closes
    };
  }

  return null;
};

// Additional time-related utility functions can be added here
export const formatRemainingTime = (minutes) => {
  if (minutes > 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m remaining`;
  }
  return `${minutes}m remaining`;
};