
const { Types } = require('mongoose');

const isValidTimeFormat = (time) => {
  if (typeof time !== 'string') return false;
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

const convertTo12Hour = (time) => {
  if (!isValidTimeFormat(time)) return time;
  const [hours, minutes] = time.split(':').map(Number);
  let period = 'AM';
  let convertedHours = hours;

  if (hours === 0) {
    convertedHours = 12;
  } else if (hours === 12) {
    period = 'PM';
  } else if (hours > 12) {
    convertedHours = hours - 12;
    period = 'PM';
  }

  return `${convertedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const filterAllowedFields = (input, allowedFields) => {
  const filtered = {};
  for (const key of Object.keys(input)) {
    if (allowedFields.includes(key)) {
      filtered[key] = input[key];
    }
  }
  return filtered;
};

const isValidObjectId = (id) => {
  return Types.ObjectId.isValid(id);
};

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date);
};

module.exports = {
  convertTo12Hour,
  isValidObjectId,
  filterAllowedFields,
  formatDate,
  isValidDate,
};