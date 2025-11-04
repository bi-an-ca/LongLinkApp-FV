import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../lib/database.types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  partner: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string, timezone: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  linkPartner: (inviteCode: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [partner, setPartner] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        }
        setLoading(false);
      })();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
          setPartner(null);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        return;
      }

      if (profileData) {
        setProfile(profileData);

        if (profileData.partner_id) {
          const { data: partnerData, error: partnerError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', profileData.partner_id)
            .maybeSingle();

          if (partnerError) {
            console.error('Error loading partner:', partnerError);
          } else if (partnerData) {
            setPartner(partnerData);
          }
        } else {
          setPartner(null);
        }
      } else {
        // Profile doesn't exist, create it
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: userData.user.email || '',
              display_name: userData.user.email?.split('@')[0] || 'User',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            });

          if (createError) {
            console.error('Error creating profile:', createError);
          } else {
            await loadProfile(userId);
          }
        }
      }
    } catch (error) {
      console.error('Unexpected error in loadProfile:', error);
    }
  };

  const signUp = async (email: string, password: string, displayName: string, timezone: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email,
          display_name: displayName,
          timezone,
        });

      if (profileError) throw profileError;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      // Provide more helpful error messages
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      } else if (error.message.includes('Email not confirmed')) {
        throw new Error('Please verify your email address before signing in.');
      } else {
        throw new Error(error.message || 'Failed to sign in. Please try again.');
      }
    }

    // Ensure profile exists after sign in
    if (data.user) {
      await loadProfile(data.user.id);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
    setPartner(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;

    await loadProfile(user.id);
  };

  const linkPartner = async (inviteCode: string) => {
    if (!user) return;

    const upperInviteCode = inviteCode.toUpperCase().trim();

    const { data: partnerProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('invite_code', upperInviteCode)
      .maybeSingle();

    if (!partnerProfile) {
      throw new Error('No one found with that invite code');
    }

    if (partnerProfile.id === user.id) {
      throw new Error('You cannot link with yourself');
    }

    if (partnerProfile.partner_id) {
      throw new Error('This person is already linked with someone else');
    }

    await supabase
      .from('profiles')
      .update({ partner_id: partnerProfile.id })
      .eq('id', user.id);

    await supabase
      .from('profiles')
      .update({ partner_id: user.id })
      .eq('id', partnerProfile.id);

    await loadProfile(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        partner,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        linkPartner,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
