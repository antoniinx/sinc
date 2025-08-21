import { useState, useMemo, useCallback, memo } from 'react'
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, startOfDay, endOfDay } from 'date-fns'
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

function EnhancedCalendar({ events, onEventClick, groups = [], onSelectSlot, onSelectEvent, view: controlledView, date: controlledDate, onNavigate, onView, hideToolbar = false, onOpenEvent }) {
  const [uncontrolledView, setUncontrolledView] = useState(Views.MONTH)
  const [uncontrolledDate, setUncontrolledDate] = useState(new Date())
  const view = controlledView ?? uncontrolledView
  const date = controlledDate ?? uncontrolledDate

  const calendarEvents = useMemo(() => {
    return events.map(event => {
      console.log('Processing event:', event)
      const startDate = new Date(`${event.date}${event.time ? `T${event.time}` : ''}`)
      let endDate = startDate

      // Handle multi-day events
      if (event.end_date) {
        endDate = new Date(`${event.end_date}${event.end_time ? `T${event.end_time}` : ''}`)
        // If no end time is specified, set it to end of day
        if (!event.end_time) {
          endDate = endOfDay(endDate)
        }
      } else if (event.time) {
        // Single day event with time
        if (event.end_time) {
          // Use the actual end time from the database
          endDate = new Date(`${event.date}T${event.end_time}`)
          console.log('Using end_time from database:', event.end_time, 'endDate:', endDate)
        } else {
          // If no end time specified, add 1 hour as default
          endDate = new Date(startDate.getTime() + 60 * 60 * 1000)
          console.log('No end_time found, using default 1 hour')
        }
      } else {
        // All-day event - set to end of day
        endDate = endOfDay(startDate)
      }

      const calendarEvent = {
        id: event.id,
        title: event.title,
        start: startDate,
        end: endDate,
        resource: event,
        allDay: !event.time && !event.end_time
      }
      
      console.log('Created calendar event:', calendarEvent)
      return calendarEvent
    })
  }, [events])

  const groupColorMap = useMemo(() => {
    const map = new Map()
    for (const g of groups) {
      if (g && g.id != null) {
        map.set(g.id, g.color || '#3b82f6')
      }
    }
    return map
  }, [groups])

  const eventStyleGetter = useCallback((event) => {
    let backgroundColor = '#3b82f6' // default blue
    let borderColor = '#2563eb'
    
    // Use direct color if available (for friend events)
    if (event.resource.color) {
      backgroundColor = event.resource.color
      borderColor = event.resource.color
    }
    // Use group color if available
    else if (event.resource.group_id) {
      const color = groupColorMap.get(event.resource.group_id)
      if (color) {
        backgroundColor = color
        borderColor = color
      }
    }
    
    // Override with attendance status if available
    if (event.resource.user_status === 'maybe') {
      backgroundColor = '#f59e0b' // amber
      borderColor = '#d97706'
    } else if (event.resource.user_status === 'no') {
      backgroundColor = '#ef4444' // red
      borderColor = '#dc2626'
    }

    return {
      style: {
        backgroundColor,
        border: `2px solid ${borderColor}`,
        borderRadius: '0',
        opacity: 0.95,
        color: 'white',
        fontWeight: 600,
        fontSize: '0.8rem',
        padding: '2px 6px',
        boxShadow: 'none',
        display: 'block',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        margin: '1px 0',
        minHeight: '22px',
        lineHeight: 1.25
      }
    }
  }, [groupColorMap])

  const handleOpen = useCallback((e) => {
    if (onOpenEvent) return onOpenEvent(e.resource || e)
    if (onEventClick) return onEventClick(e.resource || e)
  }, [onOpenEvent, onEventClick])

  const handleSelectSlot = ({ start, end, slots, action }) => {
    if (action === 'select' && onSelectSlot) {
      onSelectSlot({ start, end, slots })
    }
  }

  const handleSelectEvent = (event) => {
    if (onSelectEvent) {
      onSelectEvent(event)
    } else if (onOpenEvent) {
      onOpenEvent(event.resource)
    } else if (onEventClick) {
      onEventClick(event.resource)
    }
  }

  const customMessages = {
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
    showMore: total => `+ ${total} dalších`,
    allDay: "Celý den"
  }

    return (
      <div className="h-full bg-white rounded-none shadow-none border border-gray-200">
        <div className="h-full px-1 sm:px-2">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          view={view}
          onView={(v) => (onView ? onView(v) : setUncontrolledView(v))}
          date={date}
          onNavigate={(d) => (onNavigate ? onNavigate(d) : setUncontrolledDate(d))}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable={true}
          eventPropGetter={eventStyleGetter}
          messages={customMessages}
          views={['month', 'week', 'day']}
          defaultView="month"
          culture="cs"
          step={60}
          timeslots={1}
          min={new Date(0, 0, 0, 6, 0, 0)} // 6 AM
          max={new Date(0, 0, 0, 22, 0, 0)} // 10 PM
                    className={`enhanced-calendar calendar-full-bleed ${hideToolbar ? 'hide-toolbar' : ''}`}
          components={{ ...(hideToolbar ? { toolbar: () => null } : {}) }}
        />
      </div>
    </div>
  )
}

export default memo(EnhancedCalendar)
