import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MoodCheckin as MoodCheckinType } from '../lib/database.types';

const MOODS = [
  { emoji: '😊', label: 'Happy', color: 'from-yellow-200 to-amber-200' },
  { emoji: '🥰', label: 'Loved', color: 'from-pink-200 to-rose-200' },
  { emoji: '😌', label: 'Peaceful', color: 'from-blue-200 to-cyan-200' },
  { emoji: '😴', label: 'Tired', color: 'from-purple-200 to-indigo-200' },
  { emoji: '😔', label: 'Sad', color: 'from-gray-200 to-slate-200' },
  { emoji: '😰', label: 'Stressed', color: 'from-orange-200 to-red-200' },
  { emoji: '😤', label: 'Frustrated', color: 'from-red-200 to-pink-200' },
  { emoji: '🤗', label: 'Grateful', color: 'from-green-200 to-emerald-200' },
];

export default function MoodCheckin() {
  const [myMood, setMyMood] = useState<MoodCheckinType | null>(null);
  const [partnerMood, setPartnerMood] = useState<MoodCheckinType | null>(null);
  const [selectedMood, setSelectedMood] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const { profile, partner } = useAuth();

  useEffect(() => {
    if (profile && partner) {
      loadMoods();
    }
  }, [profile, partner]);

  const loadMoods = async () => {
    if (!profile || !partner) return;

    const today = new Date().toISOString().split('T')[0];

    const { data: myMoodData } = await supabase
      .from('mood_checkins')
      .select('*')
      .eq('user_id', profile.id)
      .eq('date', today)
      .maybeSingle();

    const { data: partnerMoodData } = await supabase
      .from('mood_checkins')
      .select('*')
      .eq('user_id', partner.id)
      .eq('date', today)
      .maybeSingle();

    setMyMood(myMoodData);
    setPartnerMood(partnerMoodData);

    if (myMoodData) {
      setSelectedMood(myMoodData.mood);
      setNote(myMoodData.note);
    }
  };

  const handleSaveMood = async () => {
    if (!selectedMood || !profile || loading) return;

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      if (myMood) {
        await supabase
          .from('mood_checkins')
          .update({
            mood: selectedMood,
            note: note,
          })
          .eq('id', myMood.id);
      } else {
        await supabase.from('mood_checkins').insert({
          user_id: profile.id,
          mood: selectedMood,
          note: note,
          date: today,
        });
      }

      loadMoods();
    } catch (error) {
      console.error('Error saving mood:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodData = (moodLabel: string) => {
    return MOODS.find((m) => m.label === moodLabel);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">How are you feeling today?</h2>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {MOODS.map((mood) => (
            <button
              key={mood.label}
              onClick={() => setSelectedMood(mood.label)}
              className={`p-4 rounded-2xl transition-all ${
                selectedMood === mood.label
                  ? `bg-gradient-to-br ${mood.color} scale-105 shadow-lg`
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="text-3xl mb-1">{mood.emoji}</div>
              <div className="text-xs font-medium text-gray-700">{mood.label}</div>
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add a note (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none resize-none"
          />
        </div>

        <button
          onClick={handleSaveMood}
          disabled={!selectedMood || loading}
          className="w-full bg-gradient-to-r brand-coral text-white py-3 rounded-xl font-medium hover:from-pink-500 hover:to-rose-500 transition-all disabled:opacity-50 shadow-lg"
        >
          {loading ? 'Saving...' : myMood ? 'Update Mood' : 'Save Mood'}
        </button>
      </div>

      {partner && partnerMood && (
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            {partner.display_name}'s mood today
          </h3>

          <div
            className={`inline-flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br ${
              getMoodData(partnerMood.mood)?.color || 'from-gray-200 to-slate-200'
            }`}
          >
            <span className="text-4xl">{getMoodData(partnerMood.mood)?.emoji}</span>
            <div>
              <p className="font-semibold text-gray-800">{partnerMood.mood}</p>
              {partnerMood.note && (
                <p className="text-sm text-gray-600 mt-1">{partnerMood.note}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {partner && !partnerMood && (
        <div className="bg-white rounded-3xl shadow-xl p-6 text-center">
          <p className="text-gray-500">{partner.display_name} hasn't checked in today yet</p>
        </div>
      )}
    </div>
  );
}
