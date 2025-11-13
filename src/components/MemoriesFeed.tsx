import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Memory } from '../lib/database.types';
import { Plus, Heart, Trash2, Image as ImageIcon, X } from 'lucide-react';

export default function MemoriesFeed() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profile, partner } = useAuth();

  useEffect(() => {
    if (profile && partner) {
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
    if (!profile || !partner) return;

    const { data } = await supabase
      .from('memories')
      .select('*')
      .or(`user_id.eq.${profile.id},user_id.eq.${partner.id}`)
      .order('created_at', { ascending: false });

    if (data) {
      setMemories(data);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

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
    if (!profile) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${profile.id}/${Date.now()}.${fileExt}`;
    const filePath = `memories/${fileName}`;

    setUploadingImage(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from('memories')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        toast.error('Failed to upload image. Please try again.');
        return null;
      }

      const { data } = supabase.storage.from('memories').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateMemory = async () => {
    if ((!newContent.trim() && !selectedImage) || !profile || !partner || loading || uploadingImage) return;

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

      const { error } = await supabase.from('memories').insert({
        user_id: profile.id,
        partner_id: partner.id,
        type: selectedImage ? 'photo' : 'note',
        content: newContent,
        media_url: imageUrl || '',
      });

      if (error) {
        console.error('Error creating memory:', error);
        toast.error('Failed to create memory. Please try again.');
        return;
      }

      setNewContent('');
      removeImage();
      setShowCreate(false);
      toast.success('Memory created!');
    } catch (error) {
      console.error('Error creating memory:', error);
      toast.error('Failed to create memory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMemory = async (memoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this memory? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase.from('memories').delete().eq('id', memoryId);
      if (error) {
        console.error('Error deleting memory:', error);
        toast.error('Failed to delete memory. Please try again.');
        return;
      }
      loadMemories();
      toast.success('Memory deleted');
    } catch (error) {
      console.error('Error deleting memory:', error);
      toast.error('Failed to delete memory. Please try again.');
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

  if (false) { // Allow solo use
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please link with your partner to create memories</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Our Memories</h2>
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
          
          {imagePreview && (
            <div className="relative mb-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-64 rounded-xl object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Share a moment, thought, or memory..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none resize-none mb-4"
          />
          
          <div className="mb-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
              id="memory-image-input"
            />
            <label
              htmlFor="memory-image-input"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors text-sm text-gray-700"
            >
              <ImageIcon className="w-4 h-4" />
              {selectedImage ? 'Change Image' : 'Add Photo'}
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreateMemory}
              disabled={(!newContent.trim() && !selectedImage) || loading || uploadingImage}
              className="flex-1 bg-gradient-to-r from-brand-coral to-pink-500 text-white py-2 rounded-xl font-medium hover:from-pink-500 hover:to-rose-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploadingImage ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : loading ? (
                'Saving...'
              ) : (
                'Save Memory'
              )}
            </button>
            <button
              onClick={() => {
                setShowCreate(false);
                setNewContent('');
                removeImage();
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
            <p className="text-gray-500">No memories yet. Start creating your story together!</p>
          </div>
        )}

        {memories.map((memory) => {
          const isMyMemory = memory.user_id === profile?.id;
          const author = isMyMemory ? profile : partner;

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
                  className="w-full rounded-2xl mb-3 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(memory.media_url, '_blank')}
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
