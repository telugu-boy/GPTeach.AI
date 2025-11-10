import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { createCalendarEvent } from '../lib/googleCalendar';
import { linkPlanToCalendarEvent } from '../features/plans/plansSlice';
import type { Plan } from '../lib/types';

interface AddToCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
}

export default function AddToCalendarModal({ isOpen, onClose, plan }: AddToCalendarModalProps) {
  const dispatch = useDispatch();
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState('09:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const startDateTime = new Date(`${eventDate}T${eventTime}`);
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // Default to 1 hour duration

      const event = await createCalendarEvent({
        plan,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
      });
      
      if (event?.id) {
        dispatch(linkPlanToCalendarEvent({ planId: plan.id, eventId: event.id }));
        onClose();
      } else {
          throw new Error("Failed to create event. The response was empty.");
      }
    } catch (err) {
      console.error('Failed to create calendar event:', err);
      setError('Could not create the event. Please ensure you have granted calendar permissions and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold">Add to Google Calendar</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <p>Add the lesson "<strong>{plan.title}</strong>" to your calendar.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="eventDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <input id="eventDate" type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
              </div>
              <div>
                <label htmlFor="eventTime" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Time</label>
                <input id="eventTime" type="time" value={eventTime} onChange={e => setEventTime(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <div className="flex justify-end p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 mr-2">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:bg-emerald-300">
              <CalendarIcon size={16}/> {isSubmitting ? 'Adding...' : 'Add to Calendar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}