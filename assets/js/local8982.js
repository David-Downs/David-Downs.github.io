// ==========================================================
// UMWA LOCAL 8982
// Website JavaScript
// ==========================================================


// ---------- AUTOMATIC NEXT UNION MEETING ----------
//
// Regular meeting:
// Third Sunday of every month at 8:00 AM
//

function getNextUnionMeeting() {

  const now = new Date();

  let year = now.getFullYear();
  let month = now.getMonth();

  function thirdSunday(year, month) {

    // Start with the first day of the month
    const firstDay = new Date(year, month, 1);

    // JavaScript: Sunday = 0
    const dayOfWeek = firstDay.getDay();

    // Find the date of the first Sunday
    const firstSunday =
      1 + ((7 - dayOfWeek) % 7);

    // Third Sunday is 14 days after first Sunday
    return new Date(
      year,
      month,
      firstSunday + 14,
      8,
      0,
      0
    );
  }

  let meeting = thirdSunday(year, month);

  // If this month's meeting has already passed,
  // calculate next month's meeting.
  if (now > meeting) {

    month++;

    if (month > 11) {
      month = 0;
      year++;
    }

    meeting = thirdSunday(year, month);
  }

  return meeting;
}


// ---------- DISPLAY NEXT MEETING ----------

const meetingDateElement =
  document.getElementById("nextMeetingDate");

if (meetingDateElement) {

  const nextMeeting = getNextUnionMeeting();

  const dateOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  };

  meetingDateElement.textContent =
    nextMeeting.toLocaleDateString(
      "en-US",
      dateOptions
    );
}


// ---------- COPYRIGHT YEAR ----------

const yearElement =
  document.getElementById("currentYear");

if (yearElement) {
  yearElement.textContent =
    new Date().getFullYear();
}
