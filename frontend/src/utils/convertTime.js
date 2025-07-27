const convertTo24Hour = (time12h) => {
  if (!time12h) return '';
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');

  hours = parseInt(hours, 10);

  if (modifier === 'AM' && hours === 12) {
    hours = 0;
  } else if (modifier === 'PM' && hours !== 12) {
    hours += 12;
  }

  const paddedHours = hours.toString().padStart(2, '0');
  return `${paddedHours}:${minutes}`;
};

const convertTo12Hour = (time24h) => {
  if (!time24h) return '';
  let [hours, minutes] = time24h.split(':');
  hours = parseInt(hours, 10);

  let modifier = 'AM';
  if (hours >= 12) modifier = 'PM';
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;

  return `${hours}:${minutes} ${modifier}`;
};

export  { convertTo12Hour, convertTo24Hour };
