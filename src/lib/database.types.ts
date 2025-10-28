export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string
          timezone: string
          partner_id: string | null
          avatar_url: string
          invite_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string
          timezone?: string
          partner_id?: string | null
          avatar_url?: string
          invite_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          timezone?: string
          partner_id?: string | null
          avatar_url?: string
          invite_code?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          image_url: string
          reaction: string
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content?: string
          image_url?: string
          reaction?: string
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          image_url?: string
          reaction?: string
          created_at?: string
        }
      }
      mood_checkins: {
        Row: {
          id: string
          user_id: string
          mood: string
          note: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mood: string
          note?: string
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mood?: string
          note?: string
          date?: string
          created_at?: string
        }
      }
      memories: {
        Row: {
          id: string
          user_id: string
          partner_id: string
          type: string
          content: string
          media_url: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          partner_id: string
          type?: string
          content?: string
          media_url?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          partner_id?: string
          type?: string
          content?: string
          media_url?: string
          created_at?: string
        }
      }
      daily_prompts: {
        Row: {
          id: string
          prompt_text: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          prompt_text: string
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          prompt_text?: string
          date?: string
          created_at?: string
        }
      }
      prompt_responses: {
        Row: {
          id: string
          prompt_id: string
          user_id: string
          response: string
          created_at: string
        }
        Insert: {
          id?: string
          prompt_id: string
          user_id: string
          response: string
          created_at?: string
        }
        Update: {
          id?: string
          prompt_id?: string
          user_id?: string
          response?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
export type MoodCheckin = Database['public']['Tables']['mood_checkins']['Row']
export type Memory = Database['public']['Tables']['memories']['Row']
export type DailyPrompt = Database['public']['Tables']['daily_prompts']['Row']
export type PromptResponse = Database['public']['Tables']['prompt_responses']['Row']
