import { format } from "date-fns";

function dateFormatUtils(date) {
  const extractDate = new Date(date);
  return format(extractDate, "EEE dd MMM");
}

export default dateFormatUtils;
