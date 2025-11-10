import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ChatMessage } from '../lib/database.types';
import { Send, Smile, Image as ImageIcon } from 'lucide-react';

const EMOJI_REACTIONS = ['❤️', '😊', '😂', '🥰', '😢', '👍'];

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { profile, partner } = useAuth();

  useEffect(() => {
    if (profile && partner) {
      loadMessages();

      const channel = supabase
        .channel('chat_messages')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chat_messages',
          },
          () => {
            loadMessages();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile, partner]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!profile || !partner) return;

    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .or(`sender_id.eq.${profile.id},sender_id.eq.${partner.id}`)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !profile || !partner || loading) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('chat_messages').insert({
        sender_id: profile.id,
        receiver_id: partner.id,
        content: newMessage.trim(),
      });

      if (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
        return;
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ reaction: emoji })
        .eq('id', messageId);

      if (error) {
        console.error('Error adding reaction:', error);
        return;
      }

      loadMessages();
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  if (!partner) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please link with your partner to start chatting</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl h-[calc(100vh-280px)] flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800">Chat with {partner.display_name}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isMine = message.sender_id === profile?.id;
          return (
            <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md group`}>
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    isMine
                      ? 'bg-gradient-to-br from-brand-coral to-pink-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.content && <p className="break-words">{message.content}</p>}
                  {message.image_url && (
                    <img
                      src={message.image_url}
                      alt="Shared"
                      className="rounded-lg mt-2 max-w-full"
                    />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 px-2">
                  {message.reaction && <span className="text-lg">{message.reaction}</span>}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {EMOJI_REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(message.id, emoji)}
                        className="hover:scale-125 transition-transform text-sm"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Add emoji"
          >
            <Smile className="w-6 h-6 text-gray-400" />
          </button>
          <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Add image"
          >
            <ImageIcon className="w-6 h-6 text-gray-400" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none"
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="p-2 bg-gradient-to-br from-brand-coral to-pink-500 text-white rounded-full hover:from-pink-500 hover:to-rose-500 transition-all disabled:opacity-50"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </form>
    </div>
  );
}
