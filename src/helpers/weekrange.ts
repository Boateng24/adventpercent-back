export const getStartAndEndOfWeek = (date = new Date()) => {
  // Convert the input date to UTC
  const dateInUTC = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );

  // Get the first day of the week in UTC
  const firstDayOfWeek = new Date(dateInUTC);
  firstDayOfWeek.setUTCDate(dateInUTC.getUTCDate() - dateInUTC.getUTCDay());

  // Get the last day of the week in UTC
  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setUTCDate(firstDayOfWeek.getUTCDate() + 6);

  return { startDate: firstDayOfWeek, endDate: lastDayOfWeek };
};
