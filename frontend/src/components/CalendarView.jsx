import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { cs } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = {
  'cs': cs,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

export default function CalendarView({ events, onEventClick, groups = [] }) {
  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: new Date(`${event.date}${event.time ? `T${event.time}` : ''}`),
    end: new Date(`${event.date}${event.time ? `T${event.time}` : ''}`),
    resource: event
  }))

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3b82f6' // default blue
    
    // Use group color if available
    if (event.resource.group_id) {
      const group = groups.find(g => g.id === event.resource.group_id)
      if (group && group.color) {
        backgroundColor = group.color
      }
    }
    
    // Override with attendance status if available
    if (event.resource.user_status === 'maybe') {
      backgroundColor = '#f59e0b' // amber
    } else if (event.resource.user_status === 'no') {
      backgroundColor = '#ef4444' // red
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    }
  }

  return (
    <div className="h-96">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={(event) => onEventClick(event.resource)}
        eventPropGetter={eventStyleGetter}
        messages={{
          next: "Další",
          previous: "Předchozí",
          today: "Dnes",
          month: "Měsíc",
          week: "Týden",
          day: "Den",
          agenda: "Agenda",
          date: "Datum",
          time: "Čas",
          event: "Událost",
          noEventsInRange: "V tomto období nejsou žádné události.",
          showMore: total => `+ ${total} dalších`
        }}
        views={['month', 'week', 'day']}
        defaultView="month"
        culture="cs"
      />
    </div>
  )
}
