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

  // Subscribe to partner profile updates in real-time
  useEffect(() => {
    if (!profile?.partner_id) {
      setPartner(null);
      return;
    }

    // Load partner initially
    const loadPartner = async () => {
      const { data: partnerData, error: partnerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profile.partner_id)
        .maybeSingle();

      if (partnerError) {
        console.error('Error loading partner:', partnerError);
      } else if (partnerData) {
        setPartner(partnerData);
      }
    };

    loadPartner();

    // Subscribe to partner profile changes
    const channel = supabase
      .channel(`partner_profile_${profile.partner_id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profile.partner_id}`,
        },
        (payload) => {
          if (import.meta.env.DEV) {
            console.log('Partner profile updated:', payload.new);
          }
          setPartner(payload.new as Profile);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.partner_id]);

  // Subscribe to own profile updates (in case partner_id changes)
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel(`own_profile_${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profile.id}`,
        },
        async (payload) => {
          if (import.meta.env.DEV) {
            console.log('Own profile updated, reloading...', payload.new);
          }
          const updatedProfile = payload.new as Profile;
          setProfile(updatedProfile);
          
          // If partner_id changed, reload partner
          if (updatedProfile.partner_id) {
            if (!partner || partner.id !== updatedProfile.partner_id) {
              const { data: partnerData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', updatedProfile.partner_id)
                .maybeSingle();
              
              if (partnerData) {
                setPartner(partnerData);
              }
            }
          } else {
            setPartner(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, partner?.id]);

  const loadProfile = async (userId: string) => {
    try {
      if (import.meta.env.DEV) {
        console.log('Loading profile for user:', userId);
      }
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        console.error('Profile error details:', {
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
          code: profileError.code
        });
        return;
      }

      if (import.meta.env.DEV) {
        console.log('Profile data received:', profileData ? 'Found' : 'Not found');
      }

      if (profileData) {
        setProfile(profileData);
        if (import.meta.env.DEV) {
          console.log('Profile set:', profileData.display_name);
        }

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
            if (import.meta.env.DEV) {
              console.log('Partner set:', partnerData.display_name);
            }
          }
        } else {
          setPartner(null);
        }
      } else {
        // Profile doesn't exist, create it
        if (import.meta.env.DEV) {
          console.log('Profile not found, creating new profile...');
        }
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
            console.error('Create profile error details:', {
              message: createError.message,
              details: createError.details,
              hint: createError.hint,
              code: createError.code
            });
          } else {
            if (import.meta.env.DEV) {
              console.log('Profile created successfully, reloading...');
            }
            await loadProfile(userId);
          }
        } else {
          if (import.meta.env.DEV) {
            console.error('No user data available to create profile');
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
      options: {
        data: {
          display_name: displayName,
          timezone: timezone,
        }
      }
    });

    if (error) throw error;

    // Profile will be created automatically by the database trigger
    // No need to manually insert here
  };

  const signIn = async (email: string, password: string) => {
    if (import.meta.env.DEV) {
      console.log('Attempting sign in with email:', email.trim().toLowerCase());
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      if (import.meta.env.DEV) {
        console.error('Sign in error:', error);
      }
      // Provide more helpful error messages
      if (error.message.includes('Invalid login credentials') || error.message.includes('Invalid credentials')) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      } else if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
        throw new Error('Please verify your email address before signing in. Check your inbox for a confirmation email.');
      } else if (error.message.includes('User not found')) {
        throw new Error('No account found with this email. Please sign up first.');
      } else {
        throw new Error(error.message || 'Failed to sign in. Please try again.');
      }
    }

    if (import.meta.env.DEV) {
      console.log('Sign in successful, user:', data.user?.id);
    }

    // Ensure profile exists after sign in
    if (data.user) {
      // Wait a bit for session to be fully established
      await new Promise(resolve => setTimeout(resolve, 100));
      await loadProfile(data.user.id);
      
      // Force a session refresh to ensure state updates
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSession(session);
        setUser(session.user);
      }
    } else {
      throw new Error('Sign in succeeded but no user data received. Please try again.');
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

    // Check if current user already has a partner
    if (profile?.partner_id) {
      throw new Error('You are already linked with a partner');
    }

    const upperInviteCode = inviteCode.toUpperCase().trim();

    const { data: partnerProfile, error: partnerLookupError } = await supabase
      .from('profiles')
      .select('*')
      .eq('invite_code', upperInviteCode)
      .maybeSingle();

    if (partnerLookupError) {
      throw new Error('Failed to find partner. Please try again.');
    }

    if (!partnerProfile) {
      throw new Error('No one found with that invite code');
    }

    if (partnerProfile.id === user.id) {
      throw new Error('You cannot link with yourself');
    }

    // Re-check partner status right before linking (helps prevent race conditions)
    const { data: recheckPartner, error: recheckError } = await supabase
      .from('profiles')
      .select('partner_id')
      .eq('id', partnerProfile.id)
      .maybeSingle();

    if (recheckError) {
      throw new Error('Failed to verify partner status. Please try again.');
    }

    if (recheckPartner?.partner_id) {
      throw new Error('This person is already linked with someone else');
    }

    // Re-check current user's partner status
    const { data: recheckCurrentUser, error: recheckCurrentError } = await supabase
      .from('profiles')
      .select('partner_id')
      .eq('id', user.id)
      .maybeSingle();

    if (recheckCurrentError) {
      throw new Error('Failed to verify your status. Please try again.');
    }

    if (recheckCurrentUser?.partner_id) {
      throw new Error('You are already linked with a partner');
    }

    // Use atomic database function to link both partners simultaneously
    const { error: linkError } = await supabase.rpc('link_partners', {
      user1_id: user.id,
      user2_id: partnerProfile.id,
    });

    if (linkError) {
      console.error('Link partners RPC error:', linkError);
      
      // If function doesn't exist, fall back to manual updates
      if (linkError.message?.includes('function') && (linkError.message?.includes('does not exist') || linkError.code === '42883')) {
        if (import.meta.env.DEV) {
          console.warn('link_partners function not found, using fallback method');
        }
        
        // Fallback: Update both profiles manually (less safe but works)
        const { error: error1 } = await supabase
          .from('profiles')
          .update({ partner_id: partnerProfile.id })
          .eq('id', user.id);

        if (error1) {
          console.error('Fallback link error 1:', error1);
          throw new Error('Failed to link partner. Please try again.');
        }

        const { error: error2 } = await supabase
          .from('profiles')
          .update({ partner_id: user.id })
          .eq('id', partnerProfile.id);

        if (error2) {
          console.error('Fallback link error 2:', error2);
          // Rollback first update if second fails
          await supabase
            .from('profiles')
            .update({ partner_id: null })
            .eq('id', user.id);
          throw new Error('Failed to complete partner link. Please ensure the link_partners function exists in your database. Run: supabase/migrations/20251110090000_add_atomic_partner_linking_function.sql');
        }
      } else {
        // Handle specific error messages from the database function
        if (linkError.message.includes('already has a partner')) {
          throw new Error('One of you is already linked with someone else');
        } else if (linkError.message.includes('Cannot link with yourself')) {
          throw new Error('You cannot link with yourself');
        } else {
          throw new Error(linkError.message || 'Failed to link partner. Please try again.');
        }
      }
    }

    // Reload current user's profile to get updated partner_id
    await loadProfile(user.id);
    
    // Verify the link was successful on current user's side
    const { data: verifyCurrentUser } = await supabase
      .from('profiles')
      .select('partner_id')
      .eq('id', user.id)
      .single();
    
    if (verifyCurrentUser?.partner_id !== partnerProfile.id) {
      console.error('Link verification failed: Current user not linked');
      throw new Error('Failed to verify partner link. Please try again.');
    }
    
  if (import.meta.env.DEV) {
    console.log('Partner link successful! Both users should now be connected.');
  }
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
