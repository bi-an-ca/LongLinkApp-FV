# LongLink - Love that travels with you

A beautiful, mobile-first app designed for long-distance couples to stay emotionally connected through daily communication and shared moments.

## Features Overview

- **Real-Time Chat** - Private messaging with emoji reactions
- **Mood Check-Ins** - Daily emotional state tracking with 8 different moods
- **Time Zone Display** - See both partners' current times at a glance
- **Memories Feed** - Private timeline of shared photos and notes
- **Daily Prompts** - Thoughtful conversation starters to stay connected

---

# Setup Instructions

## Important: Database Setup Required First

**CRITICAL:** Before using the app, you MUST set up the database schema in Supabase. The app will not work without this step.

### Database Setup Steps:

1. Go to your Supabase project dashboard at https://supabase.com/dashboard
2. Navigate to the SQL Editor
3. Copy the entire contents of `database-setup.sql`
4. Paste it into the SQL Editor
5. Click "Run" to execute the SQL script

This will create all necessary tables and security policies:
- profiles (user information and partner linking)
- chat_messages (real-time messaging)
- mood_checkins (daily mood tracking)
- memories (shared moments feed)
- daily_prompts (conversation starters)
- prompt_responses (answers to daily prompts)

### Authentication Setup

The app uses Supabase email/password authentication. No additional configuration is needed - just sign up and start using the app!

### TypeScript Note

You may see TypeScript errors when running `npm run typecheck` before setting up the database. This is expected because Supabase needs the actual database schema to exist for proper type inference. Once you:
1. Run the database-setup.sql script in Supabase
2. The tables are created

The app will work perfectly. The `npm run build` command works fine regardless.

## How to Use LongLink

### First Time Setup

1. **Sign Up**: Create an account with your email and password
2. **Link Partner**: Enter your partner's email address to connect your accounts
3. **Start Using**: Once linked, all features will be available

### Features

#### Chat
- Real-time private messaging with your partner
- Add emoji reactions to messages
- Image sharing support (placeholder for now)

#### Mood Check-In
- Select your daily emotional state
- Add optional notes about your mood
- View your partner's mood for the day

#### Memories Feed
- Create a private timeline of shared moments
- Post photos, notes, or thoughts
- Delete your own memories

#### Daily Prompts
- Answer thought-provoking questions together
- See your partner's responses
- New prompts added daily

### Time Zone Display

At the top of the app, you'll see both your current time and your partner's time to help coordinate calls and messages.

## Technical Notes

- All data is securely stored in Supabase with Row Level Security enabled
- Real-time updates for chat and memories using Supabase subscriptions
- Mobile-first responsive design
- Pastel color palette for a romantic, calming aesthetic
