import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CalendarEvent } from '../lib/database.types';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, MapPin, X, Heart, Bell } from 'lucide-react';

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, profile, partner } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    event_type: 'other',
    location: '',
    is_shared: true,
    reminder_enabled: true,
    reminder_days_before: 1,
  });

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user, currentDate]);

  const loadEvents = async () => {
    if (!user) return;

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const { data } = await supabase
      .from('calendar_events')
      .select('*')
      .gte('event_date', startOfMonth.toISOString().split('T')[0])
      .lte('event_date', endOfMonth.toISOString().split('T')[0])
      .order('event_date', { ascending: true });

    if (data) {
      setEvents(data);
    }
    setLoading(false);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const eventData = {
      ...formData,
      user_id: user.id,
      event_time: formData.event_time || null,
    };

    if (editingEvent) {
      await supabase
        .from('calendar_events')
        .update(eventData)
        .eq('id', editingEvent.id);
    } else {
      await supabase
        .from('calendar_events')
        .insert([eventData]);
    }

    setShowEventModal(false);
    resetForm();
    loadEvents();
  };

  const handleDeleteEvent = async (eventId: string) => {
    await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId);

    loadEvents();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_date: '',
      event_time: '',
      event_type: 'other',
      location: '',
      is_shared: true,
      reminder_enabled: true,
      reminder_days_before: 1,
    });
    setEditingEvent(null);
  };

  const openEventModal = (date?: Date, event?: CalendarEvent) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description,
        event_date: event.event_date,
        event_time: event.event_time || '',
        event_type: event.event_type,
        location: event.location,
        is_shared: event.is_shared,
        reminder_enabled: event.reminder_enabled,
        reminder_days_before: event.reminder_days_before,
      });
    } else if (date) {
      setFormData({
        ...formData,
        event_date: date.toISOString().split('T')[0],
      });
    }
    setShowEventModal(true);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.event_date === dateStr);
  };

  const getNextReunion = () => {
    const now = new Date();
    const reunionEvents = events.filter(
      event => event.event_type === 'reunion' && new Date(event.event_date) >= now
    );
    return reunionEvents.sort((a, b) =>
      new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
    )[0];
  };

  const getDaysUntil = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const nextReunion = getNextReunion();
  const days = getDaysInMonth();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const eventTypeColors = {
    reunion: 'bg-brand-coral text-white',
    reminder: 'bg-blue-500 text-white',
    anniversary: 'bg-pink-500 text-white',
    birthday: 'bg-purple-500 text-white',
    other: 'bg-gray-500 text-white',
  };

  const eventTypeIcons = {
    reunion: Heart,
    reminder: Bell,
    anniversary: Heart,
    birthday: '🎂',
    other: CalendarIcon,
  };

  return (
    <div className="space-y-6">
      {nextReunion && partner && (
        <div className="bg-gradient-to-br from-brand-coral to-pink-500 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Next Reunion</p>
              <h3 className="text-2xl font-bold mb-2">{nextReunion.title}</h3>
              <div className="flex items-center gap-4 text-sm">
                {nextReunion.event_date && (
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    {new Date(nextReunion.event_date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                )}
                {nextReunion.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {nextReunion.location}
                  </div>
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-1">
                {getDaysUntil(nextReunion.event_date)}
              </div>
              <div className="text-sm opacity-90">days</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="p-2 hover:bg-brand-light rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 text-sm font-medium text-brand-coral hover:bg-brand-light rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="p-2 hover:bg-brand-light rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => openEventModal()}
              className="ml-4 flex items-center gap-2 px-4 py-2 bg-brand-coral text-white rounded-xl hover:bg-brand-coral/90 transition-colors shadow-md"
            >
              <Plus className="w-5 h-5" />
              Add Event
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isToday = day && day.toDateString() === new Date().toDateString();

            return (
              <div
                key={index}
                onClick={() => day && openEventModal(day)}
                className={`min-h-24 p-2 border border-gray-100 rounded-xl cursor-pointer transition-all hover:border-brand-coral hover:bg-brand-light/30 ${
                  !day ? 'bg-gray-50' : ''
                } ${isToday ? 'border-brand-coral border-2 bg-brand-light/50' : ''}`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-brand-coral' : 'text-gray-700'}`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map(event => {
                        const Icon = eventTypeIcons[event.event_type as keyof typeof eventTypeIcons];
                        return (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEventModal(undefined, event);
                            }}
                            className={`text-xs px-2 py-1 rounded truncate ${
                              eventTypeColors[event.event_type as keyof typeof eventTypeColors]
                            }`}
                          >
                            {event.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500 px-2">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h3 className="text-xl font-bold text-gray-800">
                {editingEvent ? 'Edit Event' : 'New Event'}
              </h3>
              <button
                onClick={() => {
                  setShowEventModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-brand-blush/30 focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none transition-all"
                  placeholder="Event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <select
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-brand-blush/30 focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none transition-all"
                >
                  <option value="reunion">Reunion</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="birthday">Birthday</option>
                  <option value="reminder">Reminder</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-brand-blush/30 focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={formData.event_time}
                    onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-brand-blush/30 focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-brand-blush/30 focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none transition-all"
                  placeholder="Event location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-brand-blush/30 focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Event description"
                />
              </div>

              {partner && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_shared"
                    checked={formData.is_shared}
                    onChange={(e) => setFormData({ ...formData, is_shared: e.target.checked })}
                    className="w-4 h-4 text-brand-coral border-gray-300 rounded focus:ring-brand-coral"
                  />
                  <label htmlFor="is_shared" className="text-sm text-gray-700">
                    Share with {partner.display_name}
                  </label>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reminder_enabled"
                  checked={formData.reminder_enabled}
                  onChange={(e) => setFormData({ ...formData, reminder_enabled: e.target.checked })}
                  className="w-4 h-4 text-brand-coral border-gray-300 rounded focus:ring-brand-coral"
                />
                <label htmlFor="reminder_enabled" className="text-sm text-gray-700">
                  Enable reminder
                </label>
              </div>

              {formData.reminder_enabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remind me (days before)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.reminder_days_before}
                    onChange={(e) => setFormData({ ...formData, reminder_days_before: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-brand-blush/30 focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none transition-all"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {editingEvent && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this event?')) {
                        handleDeleteEvent(editingEvent.id);
                        setShowEventModal(false);
                        resetForm();
                      }
                    }}
                    className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowEventModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-brand-coral text-white rounded-xl hover:bg-brand-coral/90 transition-colors font-medium shadow-md"
                >
                  {editingEvent ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
