import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ChatMessage } from '../lib/database.types';
import { Send, Smile, Image as ImageIcon, MessageCircle } from 'lucide-react';

const EMOJI_REACTIONS = ['❤️', '😊', '😂', '🰰', '😢', '👍'];

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!profile || !partner) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${profile.id}/${fileName}`;

    setUploadingImage(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from('messages')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        toast.error('Failed to upload image. Please try again.');
        return null;
      }

      const { data } = supabase.storage.from('messages').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedImage) || !profile || !partner || loading || uploadingImage) return;

    setLoading(true);
    try {
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
        if (!imageUrl) {
          setLoading(false);
          return;
        }
      }

      const { error } = await supabase.from('chat_messages').insert({
        sender_id: profile.id,
        receiver_id: partner.id,
        content: newMessage.trim(),
        image_url: imageUrl || '',
        status: 'sent',
      });

      if (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message. Please try again.');
        return;
      }

      setNewMessage('');
      removeImage();
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
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
      <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
        <MessageCircle className="w-16 h-16 text-brand-coral/50 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Chat with Your Partner</h3>
        <p className="text-gray-500 mb-4">Link with your partner to start messaging</p>
        <p className="text-sm text-gray-400">Once linked, you'll be able to send messages, reactions, and share moments together</p>
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
                  {message.image_url && (
                    <img
                      src={message.image_url}
                      alt="Shared"
                      className="rounded-lg mb-2 max-w-full cursor-pointer"
                      onClick={() => window.open(message.image_url, '_blank')}
                    />
                  )}
                  {message.content && <p className="break-words">{message.content}</p>}
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
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="text-xs text-gray-400">
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                    {isMine && (
                      <span className="text-xs text-gray-400" title={message.status || 'sent'}>
                        {message.status === 'read' ? '✓✓' : message.status === 'delivered' ? '✓✓' : message.status === 'sent' ? '✓' : '○'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {imagePreview && (
        <div className="px-4 pt-2 pb-0">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-w-xs max-h-48 rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              title="Remove image"
            >
              <span className="text-xs">×</span>
            </button>
          </div>
        </div>
      )}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Add emoji"
          >
            <Smile className="w-6 h-6 text-gray-400" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
            id="chat-image-input"
          />
          <label
            htmlFor="chat-image-input"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            title="Add image"
          >
            <ImageIcon className="w-6 h-6 text-gray-400" />
          </label>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none"
          />
          <button
            type="submit"
            disabled={loading || uploadingImage || (!newMessage.trim() && !selectedImage)}
            className="p-2 bg-gradient-to-br from-brand-coral to-pink-500 text-white rounded-full hover:from-pink-500 hover:to-rose-500 transition-all disabled:opacity-50"
          >
            {uploadingImage ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-6 h-6" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
