import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { useNavigate } from 'react-router-dom';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { listCalendarEvents } from '../lib/googleCalendar';
import type { RootState } from '../app/store';
import type { Plan } from '../lib/types';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource: {
    planId: string;
    // other data can go here
  };
};

export default function Calendar() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { items: allPlans } = useSelector((state: RootState) => state.plans);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const gcalEvents = await listCalendarEvents();
        if (gcalEvents) {
          const mappedEvents = gcalEvents.map((event: any) => {
            const planId = event.extendedProperties?.private?.planId;
            const plan = planId ? allPlans.find(p => p.id === planId) : null;
            return {
              title: plan ? plan.title : event.summary,
              start: new Date(event.start.dateTime || event.start.date),
              end: new Date(event.end.dateTime || event.end.date),
              resource: { planId },
            };
          });
          setEvents(mappedEvents);
        }
      } catch (err) {
        console.error('Error fetching calendar events:', err);
        setError('Could not load calendar events. Please ensure you have granted calendar permissions.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [allPlans]);

  const handleSelectEvent = (event: CalendarEvent) => {
    if (event.resource?.planId) {
      navigate('/planner', { state: { planId: event.resource.planId } });
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <h1 className="text-3xl font-bold mb-6">Calendar</h1>
      {error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">{error}</div>}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
            <p className="text-slate-500">Loading Calendar...</p>
        </div>
      ) : (
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-lg shadow p-4">
            <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                onSelectEvent={handleSelectEvent}
            />
        </div>
      )}
    </div>
  );
}