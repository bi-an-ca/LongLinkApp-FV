import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Memory } from '../lib/database.types';
import { Plus, Heart, Trash2 } from 'lucide-react';

export default function MemoriesFeed() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { profile, partner } = useAuth();

  useEffect(() => {
    if (profile) {
      loadMemories();

      const channel = supabase
        .channel('memories')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'memories',
          },
          () => {
            loadMemories();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile, partner]);

  const loadMemories = async () => {
    if (!profile) return;

    let query = supabase.from('memories').select('*');

    if (partner) {
      query = query.or(`user_id.eq.${profile.id},user_id.eq.${partner.id}`);
    } else {
      query = query.eq('user_id', profile.id);
    }

    const { data } = await query.order('created_at', { ascending: false });

    if (data) {
      setMemories(data);
    }
  };

  const handleCreateMemory = async () => {
    if (!newContent.trim() || !profile || loading) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('memories').insert({
        user_id: profile.id,
        partner_id: partner?.id || null,
        type: 'note',
        content: newContent,
      });

      if (error) {
        console.error('Error creating memory:', error);
        alert('Failed to create memory. Please try again.');
        return;
      }

      setNewContent('');
      setShowCreate(false);
    } catch (error) {
      console.error('Error creating memory:', error);
      alert('Failed to create memory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMemory = async (memoryId: string) => {
    if (!confirm('Are you sure you want to delete this memory? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase.from('memories').delete().eq('id', memoryId);
      if (error) {
        console.error('Error deleting memory:', error);
        alert('Failed to delete memory. Please try again.');
        return;
      }
      loadMemories();
    } catch (error) {
      console.error('Error deleting memory:', error);
      alert('Failed to delete memory. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          {partner ? 'Our Memories' : 'My Memories'}
        </h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-coral to-pink-500 text-white rounded-full hover:from-pink-500 hover:to-rose-500 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">Add Memory</span>
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Create a New Memory</h3>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Share a moment, thought, or memory..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none resize-none mb-4"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreateMemory}
              disabled={!newContent.trim() || loading}
              className="flex-1 bg-gradient-to-r from-brand-coral to-pink-500 text-white py-2 rounded-xl font-medium hover:from-pink-500 hover:to-rose-500 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Memory'}
            </button>
            <button
              onClick={() => {
                setShowCreate(false);
                setNewContent('');
              }}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {memories.length === 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <Heart className="w-16 h-16 text-pink-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {partner 
                ? "No memories yet. Start creating your story together!" 
                : "No memories yet. Start capturing your moments!"}
            </p>
          </div>
        )}

        {memories.map((memory) => {
          const isMyMemory = memory.user_id === profile?.id;
          const author = isMyMemory ? profile : (partner || profile);

          return (
            <div key={memory.id} className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-coral to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {author?.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{author?.display_name}</p>
                    <p className="text-xs text-gray-500">{formatDate(memory.created_at)}</p>
                  </div>
                </div>
                {isMyMemory && (
                  <button
                    onClick={() => handleDeleteMemory(memory.id)}
                    className="p-2 hover:bg-red-50 rounded-full transition-colors group"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                  </button>
                )}
              </div>

              {memory.media_url && (
                <img
                  src={memory.media_url}
                  alt="Memory"
                  className="w-full rounded-2xl mb-3"
                />
              )}

              {memory.content && (
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {memory.content}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
