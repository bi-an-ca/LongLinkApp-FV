import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { DailyPrompt, PromptResponse } from '../lib/database.types';
import { MessageSquare, Send } from 'lucide-react';

export default function DailyPrompts() {
  const [todayPrompt, setTodayPrompt] = useState<DailyPrompt | null>(null);
  const [myResponse, setMyResponse] = useState<PromptResponse | null>(null);
  const [partnerResponse, setPartnerResponse] = useState<PromptResponse | null>(null);
  const [responseText, setResponseText] = useState('');
  const [loading, setLoading] = useState(false);
  const { profile, partner } = useAuth();

  useEffect(() => {
    if (profile) {
      loadTodayPrompt();

      // Subscribe to prompt response updates
      const channel = supabase
        .channel('prompt_responses')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'prompt_responses',
          },
          () => {
            loadTodayPrompt();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile, partner]);

  const loadTodayPrompt = async () => {
    if (!profile) return;

    const today = new Date().toISOString().split('T')[0];

    const { data: promptData } = await supabase
      .from('daily_prompts')
      .select('*')
      .eq('date', today)
      .maybeSingle();

    if (promptData) {
      setTodayPrompt(promptData);

      const { data: myResponseData } = await supabase
        .from('prompt_responses')
        .select('*')
        .eq('prompt_id', promptData.id)
        .eq('user_id', profile.id)
        .maybeSingle();

      if (partner) {
        const { data: partnerResponseData } = await supabase
          .from('prompt_responses')
          .select('*')
          .eq('prompt_id', promptData.id)
          .eq('user_id', partner.id)
          .maybeSingle();

        setPartnerResponse(partnerResponseData);
      } else {
        setPartnerResponse(null);
      }

      setMyResponse(myResponseData);

      if (myResponseData) {
        setResponseText(myResponseData.response);
      }
    }
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim() || !profile || !todayPrompt || loading) return;

    setLoading(true);
    try {
      if (myResponse) {
        const { error } = await supabase
          .from('prompt_responses')
          .update({
            response: responseText.trim(),
          })
          .eq('id', myResponse.id);

        if (error) {
          if (import.meta.env.DEV) {
            console.error('Error updating response:', error);
          }
          toast.error('Failed to update response. Please try again.');
          return;
        }
        toast.success('Response updated!');
      } else {
        const { error } = await supabase.from('prompt_responses').insert({
          prompt_id: todayPrompt.id,
          user_id: profile.id,
          response: responseText.trim(),
        });

        if (error) {
          if (import.meta.env.DEV) {
            console.error('Error creating response:', error);
          }
          toast.error('Failed to submit response. Please try again.');
          return;
        }
        toast.success('Response submitted!');
      }

      loadTodayPrompt();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error submitting response:', error);
      }
      toast.error('Failed to submit response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (false) { // Allow solo use
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please link with your partner to see daily prompts</p>
      </div>
    );
  }

  if (!todayPrompt) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-16 h-16 text-brand-coral/30 mx-auto mb-4" />
        <p className="text-gray-500">No prompt available for today</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-gradient-to-br from-brand-light to-white rounded-3xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-brand-coral500" />
          </div>
          <div>
            <p className="text-sm text-brand-coral700 font-medium">Today's Prompt</p>
            <p className="text-xs text-brand-coral600">
              {new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 leading-relaxed">
          {todayPrompt.prompt_text}
        </h2>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Response</h3>
        <textarea
          value={responseText}
          onChange={(e) => setResponseText(e.target.value)}
          placeholder="Share your thoughts..."
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none resize-none mb-4"
        />
        <button
          onClick={handleSubmitResponse}
          disabled={!responseText.trim() || loading}
          className="w-full bg-gradient-to-r from-brand-coral to-pink-500 text-white py-3 rounded-xl font-medium hover:from-pink-500 hover:to-rose-500 transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
        >
          {loading ? (
            'Saving...'
          ) : (
            <>
              <Send className="w-5 h-5" />
              {myResponse ? 'Update Response' : 'Submit Response'}
            </>
          )}
        </button>
      </div>

      {partnerResponse && (
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-coral to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
              {partner?.display_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{partner?.display_name}'s Response</p>
              <p className="text-xs text-gray-500">
                {new Date(partnerResponse.created_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-xl">
            {partnerResponse.response}
          </p>
        </div>
      )}

      {!partnerResponse && myResponse && (
        <div className="bg-white rounded-3xl shadow-xl p-6 text-center">
          <p className="text-gray-500">{partner?.display_name} hasn't responded yet</p>
        </div>
      )}
    </div>
  );
}
