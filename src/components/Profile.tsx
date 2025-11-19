import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Palette, Settings, X, Save, Moon, Sun } from 'lucide-react';
import toast from 'react-hot-toast';
import Milestones from './Milestones';

export default function Profile() {
  const { profile, updateProfile, partner } = useAuth();
  const { colors, updateTheme, darkMode, toggleDarkMode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [tempColors, setTempColors] = useState(colors);

  // Update tempColors when colors change
  useEffect(() => {
    if (colors) {
      setTempColors(colors);
    }
  }, [colors]);

  // Update displayName when profile changes
  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    }
  }, [profile]);

  const presetThemes = [
    { name: 'Default Pink', accent: '#F7838D', background: '#FFECF2', blush: '#FAC2C6' },
    { name: 'Ocean Blue', accent: '#4A90E2', background: '#E8F4F8', blush: '#B8D4E3' },
    { name: 'Forest Green', accent: '#52B788', background: '#E8F5E9', blush: '#C8E6C9' },
    { name: 'Sunset Orange', accent: '#FF6B6B', background: '#FFF5F5', blush: '#FFE0E0' },
    { name: 'Purple Dream', accent: '#9B59B6', background: '#F4E6FF', blush: '#E1BEE7' },
    { name: 'Golden Hour', accent: '#F39C12', background: '#FFF8E1', blush: '#FFE082' },
  ];

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      toast.error('Display name cannot be empty');
      return;
    }

    try {
      await updateProfile({ display_name: displayName.trim() });
      setIsEditing(false);
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  // Normalize color to 6-digit hex format
  const normalizeColor = (color: string): string => {
    if (!color) return '#F7838D';
    // Remove any whitespace
    color = color.trim();
    // Add # if missing
    if (!color.startsWith('#')) {
      color = '#' + color;
    }
    // Convert 3-digit hex to 6-digit
    if (color.length === 4 && /^#[0-9A-Fa-f]{3}$/.test(color)) {
      color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
    }
    return color.toUpperCase();
  };

  const handleSaveTheme = async () => {
    try {
      // Normalize colors
      const normalizedColors = {
        accent: normalizeColor(tempColors.accent),
        background: normalizeColor(tempColors.background),
        blush: normalizeColor(tempColors.blush),
      };

      // Validate color format
      const colorRegex = /^#([A-Fa-f0-9]{6})$/;
      if (!colorRegex.test(normalizedColors.accent) || !colorRegex.test(normalizedColors.background) || !colorRegex.test(normalizedColors.blush)) {
        toast.error('Please enter valid hex color codes (e.g., #F7838D)');
        return;
      }

      if (!profile) {
        toast.error('Please sign in to save theme changes');
        return;
      }

      await updateTheme(normalizedColors);
    } catch (error) {
      console.error('Error saving theme:', error);
      toast.error('Failed to save theme changes');
    }
  };

  const applyPreset = (preset: typeof presetThemes[0]) => {
    setTempColors({
      accent: preset.accent,
      background: preset.background,
      blush: preset.blush,
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-brand-coral to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {profile?.display_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="text-2xl font-bold text-gray-800 border-b-2 border-brand-coral focus:outline-none"
                  placeholder="Your name"
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-800">{profile?.display_name || 'User'}</h2>
              )}
              <p className="text-gray-500 text-sm mt-1">{profile?.email}</p>
            </div>
          </div>
          {!isEditing ? (
            <button
              onClick={() => {
                setIsEditing(true);
                setDisplayName(profile?.display_name || '');
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Edit profile"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setDisplayName(profile?.display_name || '');
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Cancel"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handleSaveProfile}
                className="p-2 bg-brand-coral text-white rounded-full hover:bg-brand-coral/90 transition-colors"
                title="Save"
              >
                <Save className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Timezone</p>
            <p className="font-medium text-gray-800">{profile?.timezone || 'UTC'}</p>
          </div>
          <div>
            <p className="text-gray-500">Member Since</p>
            <p className="font-medium text-gray-800">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? (
              <Moon className="w-6 h-6 text-brand-coral" />
            ) : (
              <Sun className="w-6 h-6 text-brand-coral" />
            )}
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Dark Mode</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Toggle dark theme</p>
            </div>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              darkMode ? 'bg-brand-coral' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Theme Customization */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-6 h-6 text-brand-coral" />
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Theme Customization</h3>
        </div>

        {/* Preset Themes */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Preset Themes</p>
          <div className="grid grid-cols-3 gap-3">
            {presetThemes.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="p-3 border-2 border-gray-200 rounded-xl hover:border-brand-coral transition-colors text-left"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: preset.accent }}
                  />
                  <div
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: preset.background }}
                  />
                  <div
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: preset.blush }}
                  />
                </div>
                <p className="text-xs font-medium text-gray-700">{preset.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Color Pickers */}
        <div className="space-y-4 mb-6">
          <p className="text-sm font-medium text-gray-700">Custom Colors</p>
          
          <div>
            <label className="block text-xs text-gray-600 mb-2">Accent Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={tempColors.accent}
                onChange={(e) => setTempColors({ ...tempColors, accent: e.target.value })}
                className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={tempColors.accent}
                onChange={(e) => setTempColors({ ...tempColors, accent: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none"
                placeholder="#F7838D"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-2">Background Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={tempColors.background}
                onChange={(e) => setTempColors({ ...tempColors, background: e.target.value })}
                className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={tempColors.background}
                onChange={(e) => setTempColors({ ...tempColors, background: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none"
                placeholder="#FFECF2"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-2">Blush Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={tempColors.blush}
                onChange={(e) => setTempColors({ ...tempColors, blush: e.target.value })}
                className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={tempColors.blush}
                onChange={(e) => setTempColors({ ...tempColors, blush: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none"
                placeholder="#FAC2C6"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-xs font-medium text-gray-700 mb-2">Preview</p>
          <div className="space-y-2">
            <div
              className="p-2 rounded-lg text-white text-xs text-center"
              style={{ backgroundColor: tempColors.accent }}
            >
              Accent
            </div>
            <div
              className="p-2 rounded-lg text-gray-800 text-xs text-center"
              style={{ backgroundColor: tempColors.background }}
            >
              Background
            </div>
            <div
              className="p-2 rounded-lg text-gray-800 text-xs text-center"
              style={{ backgroundColor: tempColors.blush }}
            >
              Blush
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveTheme}
          className="w-full bg-gradient-to-r from-brand-coral to-pink-500 text-white py-3 rounded-xl font-medium hover:from-pink-500 hover:to-rose-500 transition-all shadow-lg"
        >
          Save Theme
        </button>
      </div>

      {/* Relationship Milestones */}
      {partner && <Milestones />}
    </div>
  );
}

