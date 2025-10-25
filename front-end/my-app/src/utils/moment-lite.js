const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours || 12;
  return `${hours}:${minutes} ${ampm}`;
}

function formatLong(date) {
  const dayName = dayNames[date.getDay()];
  const monthName = monthNames[date.getMonth()];
  const day = date.getDate();
  const ordinal = getOrdinal(day);
  const year = date.getFullYear();
  return `${dayName}, ${monthName} ${day}${ordinal} ${year}, ${formatTime(date)}`;
}

function getOrdinal(day) {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function momentLite(input) {
  const date = input ? new Date(input) : new Date();
  return {
    format(pattern) {
      switch (pattern) {
        case "LLLL":
          return formatLong(date);
        case "h:mm A":
          return formatTime(date);
        default:
          return date.toISOString();
      }
    },
    toISOString() {
      return date.toISOString();
    },
  };
}

export default momentLite;
