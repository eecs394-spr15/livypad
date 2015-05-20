var cal = new JEC("styledCalendar", {
  tableClass: 'styledCalendar',
  firstMonth: 201503,
  lastMonth: 201506,
  firstDayOfWeek: 1,
  specialDays: [ ],
  linkNewWindow: true,
  weekdays: [
   "Sunday",
   "Monday",
   "Tuesday",
   "Wednesday",
   "Thursday",
   "Friday",
   "Saturday"
  ]
});

cal.defineEvents(
  [
    {
      eventDate: 20150331,
      eventDescription: 'Day One 3 Pitches',
      eventLink: 'day-one.php'
    },
    {
      eventDate: 20150409,
      eventDescription: 'First Demo!'
    },
    {
      eventDate: 20150423,
      eventDescription: 'Team Project Lockdown'
    },
    {
      eventDate: 20150430,
      eventDescription: 'Team Project Final Demos'
    },
    {
      eventDate: 20150514,
      eventDescription: 'Pariveda visit'
    },
    {
      eventDate: 20150604,
      eventDescription: 'Client Project Final Demos'
    }
  ]
);

cal.styleDates(
  [
    {
      styledDate: 20150430,
      dateClass: 'demoDay'
    },
    {
      styledDate: 20150525,
      dateClass: 'memorialDayWeekend'
    },
    {
      styledDate: 20150604,
      dateClass: 'demoDay'
    }
  ]
);

cal.showCalendar();
