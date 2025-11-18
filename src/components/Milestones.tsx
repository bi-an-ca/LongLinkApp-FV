import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { RelationshipMilestone } from '../lib/database.types';
import { Heart, Calendar, Plus, X, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Milestones() {
  const [milestones, setMilestones] = useState<RelationshipMilestone[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { profile, partner } = useAuth();

  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    milestone_date: new Date().toISOString().split('T')[0],
    milestone_type: 'custom',
  });

  useEffect(() => {
    if (profile && partner) {
      loadMilestones();

      const channel = supabase
        .channel('milestones')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'relationship_milestones',
          },
          () => {
            loadMilestones();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile, partner]);

  const loadMilestones = async () => {
    if (!profile || !partner) return;

    const { data } = await supabase
      .from('relationship_milestones')
      .select('*')
      .or(`user_id.eq.${profile.id},partner_id.eq.${profile.id}`)
      .order('milestone_date', { ascending: false });

    if (data) {
      // Filter to show unique milestones (avoid duplicates)
      const uniqueMilestones = data.filter(
        (milestone, index, self) =>
          index ===
          self.findIndex(
            (m) =>
              m.milestone_type === milestone.milestone_type &&
              m.milestone_date === milestone.milestone_date
          )
      );
      setMilestones(uniqueMilestones);
    }
  };

  const handleAddMilestone = async () => {
    if (!profile || !partner || !newMilestone.title.trim() || loading) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('relationship_milestones').insert({
        user_id: profile.id,
        partner_id: partner.id,
        title: newMilestone.title.trim(),
        description: newMilestone.description.trim() || null,
        milestone_date: newMilestone.milestone_date,
        milestone_type: newMilestone.milestone_type,
      });

      if (error) {
        console.error('Error creating milestone:', error);
        toast.error('Failed to create milestone. Please try again.');
        return;
      }

      setNewMilestone({
        title: '',
        description: '',
        milestone_date: new Date().toISOString().split('T')[0],
        milestone_type: 'custom',
      });
      setShowAdd(false);
      toast.success('Milestone added!');
    } catch (error) {
      console.error('Error creating milestone:', error);
      toast.error('Failed to create milestone. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case 'first_message':
        return '💬';
      case 'first_memory':
        return '📸';
      case 'anniversary':
        return '💍';
      default:
        return '🎉';
    }
  };

  if (!partner) {
    return null;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Milestones</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-coral to-pink-500 text-white rounded-full hover:from-pink-500 hover:to-rose-500 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">Add Milestone</span>
        </button>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Add New Milestone
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newMilestone.title}
                onChange={(e) =>
                  setNewMilestone({ ...newMilestone, title: e.target.value })
                }
                placeholder="e.g., Our Anniversary"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={newMilestone.milestone_date}
                onChange={(e) =>
                  setNewMilestone({ ...newMilestone, milestone_date: e.target.value })
                }
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (optional)
              </label>
              <textarea
                value={newMilestone.description}
                onChange={(e) =>
                  setNewMilestone({ ...newMilestone, description: e.target.value })
                }
                placeholder="Add a note about this milestone..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddMilestone}
                disabled={!newMilestone.title.trim() || loading}
                className="flex-1 bg-gradient-to-r from-brand-coral to-pink-500 text-white py-2 rounded-xl font-medium hover:from-pink-500 hover:to-rose-500 transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Milestone'}
              </button>
              <button
                onClick={() => {
                  setShowAdd(false);
                  setNewMilestone({
                    title: '',
                    description: '',
                    milestone_date: new Date().toISOString().split('T')[0],
                    milestone_type: 'custom',
                  });
                }}
                className="px-6 py-2 bg-gray-100 dark:bg-gray-700 dark:text-white text-gray-700 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {milestones.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-12 text-center">
            <Trophy className="w-16 h-16 text-pink-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No milestones yet. Start tracking your special moments together!
            </p>
          </div>
        )}

        {milestones.map((milestone) => {
          const daysSince = getDaysSince(milestone.milestone_date);
          return (
            <div
              key={milestone.id}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-coral to-pink-500 rounded-full flex items-center justify-center text-2xl">
                  {getMilestoneIcon(milestone.milestone_type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {milestone.title}
                    </h3>
                    <Calendar className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {formatDate(milestone.milestone_date)}
                  </p>
                  {milestone.description && (
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      {milestone.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <Heart className="w-4 h-4 text-brand-coral fill-brand-coral" />
                    <span className="text-sm font-medium text-brand-coral">
                      {daysSince} day{daysSince !== 1 ? 's' : ''} ago
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

